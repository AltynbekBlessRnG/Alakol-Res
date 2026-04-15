"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addModerationReview,
  appendResortImages,
  createAnalyticsEvent,
  createDraftResort,
  createLead,
  createNotification,
  createPasswordResetToken,
  createReview,
  getOwnerProfileById,
  getResortById,
  getResortCompleteness,
  getUserById,
  getValidPasswordResetToken,
  listOwnerLeads,
  markPasswordResetTokenUsed,
  moderateReview,
  replaceResortAmenities,
  replaceResortImages,
  setResortFeatured,
  type ResortStatus,
  updateLead,
  updateUserPassword,
  updateResortRecord
} from "@/lib/demo-data";
import { requireRole } from "@/lib/session";

function toBool(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function createLeadAction(formData: FormData) {
  const resortId = String(formData.get("resortId") || "");
  const guestName = String(formData.get("guestName") || "");
  const phone = String(formData.get("phone") || "");
  const note = String(formData.get("note") || "");

  if (!resortId || !guestName || !phone) return;

  const leadId = createLead({ resortId, guestName, phone, note, source: "site_form" });
  const resort = getResortById(resortId);
  if (resort) {
    const ownerProfile = getOwnerProfileById(resort.ownerProfileId);
    if (ownerProfile) {
      createNotification({
        userId: ownerProfile.userId,
        type: "lead_created",
        title: "Новая заявка",
        body: `${guestName} оставил заявку по объекту ${resort.title}.`,
        href: "/owner"
      });
    }
    createAnalyticsEvent({ eventType: "lead_created", resortId, slug: resort.slug, metadata: JSON.stringify({ leadId }) });
  }

  redirect(`/catalog?lead=success`);
}

export async function updateResortAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const id = String(formData.get("id") || "");
  const resort = getResortById(id);

  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) return;

  const amenities = String(formData.get("amenities") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const images = String(formData.get("images") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const imageItems = images.map((url, index) => ({
    url,
    kind: index === 0 ? "cover" : "gallery"
  }));

  updateResortRecord(id, {
    ...resort,
    title: String(formData.get("title") || resort.title),
    slug: slugify(String(formData.get("title") || resort.title), resort.id),
    shortDescription: String(formData.get("shortDescription") || resort.shortDescription),
    description: String(formData.get("description") || resort.description),
    zone: String(formData.get("zone") || resort.zone),
    address: String(formData.get("address") || resort.address),
    minPrice: Number(formData.get("minPrice") || resort.minPrice),
    maxPrice: Number(formData.get("maxPrice") || resort.maxPrice),
    foodOptions: String(formData.get("foodOptions") || resort.foodOptions),
    accommodationType: String(formData.get("accommodationType") || resort.accommodationType),
    contactPhone: String(formData.get("contactPhone") || resort.contactPhone),
    whatsapp: String(formData.get("whatsapp") || resort.whatsapp),
    latitude: Number(formData.get("latitude") || resort.latitude),
    longitude: Number(formData.get("longitude") || resort.longitude),
    distanceToLakeM: Number(formData.get("distanceToLakeM") || resort.distanceToLakeM),
    familyFriendly: toBool(formData.get("familyFriendly")),
    youthFriendly: toBool(formData.get("youthFriendly")),
    hasPool: toBool(formData.get("hasPool")),
    hasWifi: toBool(formData.get("hasWifi")),
    hasParking: toBool(formData.get("hasParking")),
    hasKidsZone: toBool(formData.get("hasKidsZone")),
    includedText: String(formData.get("includedText") || resort.includedText),
    rulesText: String(formData.get("rulesText") || resort.rulesText),
    beachLine: String(formData.get("beachLine") || resort.beachLine),
    transferInfo: String(formData.get("transferInfo") || resort.transferInfo),
    status: "DRAFT" as ResortStatus,
    updatedAt: new Date()
  });

  replaceResortAmenities(id, amenities);
  if (images.length) {
    replaceResortImages(id, imageItems);
  }

  addModerationReview({ resortId: id, action: "updated", comment: "Владелец обновил карточку" });

  revalidatePath("/owner");
  revalidatePath("/catalog");
  redirect(`/owner/resorts/${id}?saved=1`);
}

export async function submitResortForReviewAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const id = String(formData.get("id") || "");
  const resort = getResortById(id);

  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) return;

  const completeness = getResortCompleteness(resort);
  if (!completeness.isReady) {
    redirect(`/owner/resorts/${id}?error=${encodeURIComponent(completeness.missing.join(", "))}`);
  }

  updateResortRecord(id, { ...resort, status: "PENDING_REVIEW", updatedAt: new Date() });
  addModerationReview({ resortId: id, action: "submitted", comment: "Отправлено на модерацию" });
  const admin = getUserById("user-admin-1");
  if (admin) {
    createNotification({
      userId: admin.id,
      type: "resort_submitted",
      title: "Новый объект на модерации",
      body: `${resort.title} отправлен на проверку.`,
      href: "/admin"
    });
  }

  revalidatePath("/owner");
  revalidatePath("/admin");
  redirect(`/owner/resorts/${id}?submitted=1`);
}

export async function moderateResortAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  const comment = String(formData.get("comment") || "");
  if (!id || !action) return;

  const resort = getResortById(id);
  if (!resort) return;
  const completeness = getResortCompleteness(resort);
  if (action === "publish" && !completeness.isReady) {
    redirect("/admin?error=incomplete");
  }
  updateResortRecord(id, {
    ...resort,
    status: (action === "publish" ? "PUBLISHED" : "REJECTED") as ResortStatus,
    updatedAt: new Date()
  });
  addModerationReview({ resortId: id, adminId: session.user.id, action, comment });
  const ownerProfile = getOwnerProfileById(resort.ownerProfileId);
  if (ownerProfile) {
    createNotification({
      userId: ownerProfile.userId,
      type: action === "publish" ? "resort_published" : "resort_rejected",
      title: action === "publish" ? "Объект опубликован" : "Нужна доработка карточки",
      body: action === "publish" ? `${resort.title} теперь доступен в каталоге.` : `${resort.title} возвращён на доработку.`,
      href: `/owner/resorts/${resort.id}`
    });
  }

  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect("/admin");
}

export async function createDraftResortAction() {
  const session = await requireRole("OWNER");
  const resortId = createDraftResort(session.user.ownerProfileId!);

  redirect(`/owner/resorts/${resortId}`);
}

export async function appendUploadedImagesAction(resortId: string, urls: string[]) {
  appendResortImages(resortId, urls);
  revalidatePath(`/owner/resorts/${resortId}`);
}

export async function updateLeadAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new") as Parameters<typeof updateLead>[1]["status"];
  const ownerComment = String(formData.get("ownerComment") || "");
  const lead = listOwnerLeads(session.user.ownerProfileId!).find((item) => item.id === id);
  if (!lead) return;
  updateLead(id, { status, ownerComment });
  revalidatePath("/owner");
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") || "");
  const featured = String(formData.get("featured") || "") === "true";
  setResortFeatured(id, featured);
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function createReviewAction(formData: FormData) {
  const resortId = String(formData.get("resortId") || "");
  const authorName = String(formData.get("authorName") || "");
  const body = String(formData.get("body") || "");
  const rating = Number(formData.get("rating") || 0);
  if (!resortId || !authorName || !body || rating < 1 || rating > 5) return;
  createReview({ resortId, authorName, body, rating });
  const admin = getUserById("user-admin-1");
  if (admin) {
    createNotification({
      userId: admin.id,
      type: "resort_submitted",
      title: "Новый отзыв на модерации",
      body: `Поступил новый отзыв для объекта ${resortId}.`,
      href: "/admin"
    });
  }
  redirect(`/catalog?review=success`);
}

export async function moderateReviewAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending") as "approved" | "pending";
  moderateReview(id, status);
  revalidatePath("/admin");
  revalidatePath("/catalog");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  if (!email) return;
  createPasswordResetToken(email);
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const reset = getValidPasswordResetToken(token);
  if (!reset || password.length < 8) {
    redirect("/reset-password?error=1");
  }
  updateUserPassword(reset.userId, password);
  markPasswordResetTokenUsed(reset.id);
  redirect("/login?reset=1");
}

function slugify(value: string, fallbackId: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || `resort-${fallbackId}`;
}
