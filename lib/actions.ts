"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ResortStatus } from "@/lib/types";
import { getResortCompleteness } from "@/lib/supabase/data";
import { requireRole } from "@/lib/session";
import {
  addModerationReviewInSupabase,
  appendResortImagesInSupabase,
  createAnalyticsEventInSupabase,
  createDraftResortInSupabase,
  createLeadInSupabase,
  createNotificationInSupabase,
  createPasswordResetTokenInSupabase,
  createReviewInSupabase,
  getResortByIdFromSupabase,
  getUserByEmailFromSupabase,
  getValidPasswordResetTokenFromSupabase,
  listOwnerLeadsFromSupabase,
  markPasswordResetTokenUsedInSupabase,
  moderateReviewInSupabase,
  replaceResortAmenitiesInSupabase,
  replaceResortImagesInSupabase,
  replaceResortPricesInSupabase,
  setResortFeaturedInSupabase,
  updateLeadInSupabase,
  updateResortRecordInSupabase,
  updateUserPasswordInSupabase
} from "@/lib/supabase/data";

function toBool(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parsePriceRows(value: string) {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [label = "", amount = "", description = ""] = row.split("|").map((item) => item.trim());
      return {
        label,
        amount: Number(amount),
        description
      };
    })
    .filter((item) => item.label && Number.isFinite(item.amount) && item.amount > 0 && item.description);
}

export type ActionResult = { success: true } | { success: false; error: string };

export async function createLeadAction(formData: FormData): Promise<ActionResult> {
  try {
    const resortId = String(formData.get("resortId") || "");
    const guestName = String(formData.get("guestName") || "");
    const phone = String(formData.get("phone") || "");
    const note = String(formData.get("note") || "");

    if (!resortId || !guestName || !phone) {
      return { success: false, error: "Заполните обязательные поля" };
    }

    const leadId = await createLeadInSupabase({ resortId, guestName, phone, note, source: "site_form" });
    if (!leadId) {
      return { success: false, error: "Не удалось создать заявку" };
    }

    const resort = await getResortByIdFromSupabase(resortId);
    if (resort) {
      if (resort.ownerProfile?.userId) {
        await createNotificationInSupabase({
          userId: resort.ownerProfile.userId,
          type: "lead_created",
          title: "Новая заявка",
          body: `${guestName} оставил заявку по объекту ${resort.title}.`,
          href: "/owner"
        });
      }
      await createAnalyticsEventInSupabase({ eventType: "lead_created", resortId, slug: resort.slug, metadata: JSON.stringify({ leadId }) });
    }

    redirect(`/catalog?lead=success`);
    return { success: true };
  } catch (error) {
    console.error("createLeadAction error:", error);
    return { success: false, error: "Произошла ошибка при создании заявки" };
  }
}

export async function updateResortAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const id = String(formData.get("id") || "");
  const resort = await getResortByIdFromSupabase(id);

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
  const prices = parsePriceRows(String(formData.get("prices") || ""));

  await updateResortRecordInSupabase(id, {
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

  await replaceResortAmenitiesInSupabase(id, amenities);
  await replaceResortPricesInSupabase(id, prices);
  if (images.length) {
    await replaceResortImagesInSupabase(id, imageItems);
  }

  await addModerationReviewInSupabase({ resortId: id, action: "updated", comment: "Владелец обновил карточку" });

  revalidatePath("/owner");
  revalidatePath("/catalog");
  redirect(`/owner/resorts/${id}?saved=1`);
}

export async function submitResortForReviewAction(formData: FormData) {
  try {
    const session = await requireRole("OWNER");
    const id = String(formData.get("id") || "");
    const resort = await getResortByIdFromSupabase(id);

    if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) {
      return;
    }

    const completeness = getResortCompleteness(resort);
    if (!completeness.isReady) {
      redirect(`/owner/resorts/${id}?error=${encodeURIComponent(completeness.missing.join(", "))}`);
    }

    await updateResortRecordInSupabase(id, { ...resort, status: "PENDING_REVIEW", updatedAt: new Date() });
    await addModerationReviewInSupabase({ resortId: id, action: "submitted", comment: "Отправлено на модерацию" });
    const admin = await getUserByEmailFromSupabase("admin@alakol.kz");
    if (admin) {
      await createNotificationInSupabase({
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
  } catch (error) {
    console.error("submitResortForReviewAction error:", error);
  }
}

export async function moderateResortAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireRole("ADMIN");
    const id = String(formData.get("id") || "");
    const action = String(formData.get("action") || "");
    const comment = String(formData.get("comment") || "");
    if (!id || !action) {
      return { success: false, error: "Не указан ID объекта или действие" };
    }

    const resort = await getResortByIdFromSupabase(id);
    if (!resort) {
      return { success: false, error: "Объект не найден" };
    }
    const completeness = getResortCompleteness(resort);
    if (action === "publish" && !completeness.isReady) {
      redirect("/admin?error=incomplete");
    }
    await updateResortRecordInSupabase(id, {
      ...resort,
      status: (action === "publish" ? "PUBLISHED" : "REJECTED") as ResortStatus,
      updatedAt: new Date()
    });
    await addModerationReviewInSupabase({ resortId: id, adminId: session.user.id, action, comment });
    if (resort.ownerProfile?.userId) {
      await createNotificationInSupabase({
        userId: resort.ownerProfile.userId,
        type: action === "publish" ? "resort_published" : "resort_rejected",
        title: action === "publish" ? "Объект опубликован" : "Нужна доработка карточки",
        body: action === "publish" ? `${resort.title} теперь доступен в каталоге.` : `${resort.title} возвращён на доработку.`,
        href: `/owner/resorts/${resort.id}`
      });
    }

    revalidatePath("/admin");
    revalidatePath("/catalog");
    redirect("/admin");
    return { success: true };
  } catch (error) {
    console.error("moderateResortAction error:", error);
    return { success: false, error: "Ошибка при модерации объекта" };
  }
}

export async function createDraftResortAction(_formData?: FormData) {
  try {
    const session = await requireRole("OWNER");
    const resortId = await createDraftResortInSupabase(session.user.ownerProfileId!);
    if (!resortId) {
      return;
    }

    redirect(`/owner/resorts/${resortId}`);
  } catch (error) {
    console.error("createDraftResortAction error:", error);
  }
}

export async function appendUploadedImagesAction(resortId: string, urls: string[]) {
  await appendResortImagesInSupabase(resortId, urls);
  revalidatePath(`/owner/resorts/${resortId}`);
}

export async function updateLeadAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new") as "new" | "contacted" | "no_answer" | "booked" | "closed";
  const ownerComment = String(formData.get("ownerComment") || "");
  const lead = (await listOwnerLeadsFromSupabase(session.user.ownerProfileId!)).find((item) => item.id === id);
  if (!lead) return;
  await updateLeadInSupabase(id, { status, ownerComment });
  revalidatePath("/owner");
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") || "");
  const featured = String(formData.get("featured") || "") === "true";
  await setResortFeaturedInSupabase(id, featured);
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function createReviewAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireRole("USER");
    const resortId = String(formData.get("resortId") || "");
    const returnTo = String(formData.get("returnTo") || "/favorites");
    const body = String(formData.get("body") || "");
    const rating = Number(formData.get("rating") || 0);
    const authorName = session.user.name?.trim() || "Гость";
    if (!resortId || !body || rating < 1 || rating > 5) {
      return { success: false, error: "Заполните все поля отзыва" };
    }
    await createReviewInSupabase({ resortId, authorName, body, rating, userId: session.user.id });
    const admin = await getUserByEmailFromSupabase("admin@alakol.kz");
    if (admin) {
      await createNotificationInSupabase({
        userId: admin.id,
        type: "resort_submitted",
        title: "Новый отзыв на модерации",
        body: `Поступил новый отзыв для объекта ${resortId}.`,
        href: "/admin"
      });
    }
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}review=success#reviews`);
    return { success: true };
  } catch (error) {
    console.error("createReviewAction error:", error);
    return { success: false, error: "Ошибка при создании отзыва" };
  }
}

export async function moderateReviewAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending") as "approved" | "pending";
  await moderateReviewInSupabase(id, status);
  revalidatePath("/admin");
  revalidatePath("/catalog");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  if (!email) return;
  const token = await createPasswordResetTokenInSupabase(email);
  const user = await getUserByEmailFromSupabase(email);
  if (token && user) {
    await createNotificationInSupabase({
      userId: user.id,
      type: "password_reset",
      title: "Запрос на сброс пароля",
      body: `Токен для сброса пароля: ${token}`,
      href: "/reset-password"
    });
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const token = String(formData.get("token") || "");
    const password = String(formData.get("password") || "");
    const reset = await getValidPasswordResetTokenFromSupabase(token);
    if (!reset || password.length < 8) {
      redirect("/reset-password?error=1");
    }
    await updateUserPasswordInSupabase(reset.userId, password);
    await markPasswordResetTokenUsedInSupabase(reset.id);
    redirect("/login?reset=1");
  } catch (error) {
    console.error("resetPasswordAction error:", error);
  }
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
