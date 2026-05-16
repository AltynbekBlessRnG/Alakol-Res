"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import type { ResortStatus } from "@/lib/types";
import { getResortCompleteness } from "@/lib/supabase/data";
import { requireRole } from "@/lib/session";
import { notifyLeadToTelegram } from "@/lib/telegram";
import {
  leadSchema,
  moderationReviewSchema,
  ownerLeadUpdateSchema,
  ownerResortFormSchema,
  passwordResetRequestSchema,
  resetPasswordSchema,
  reviewSchema
} from "@/lib/validation";
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

function parsePriceRows(value: string) {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const parts = row.includes("|")
        ? row.split("|").map((item) => item.trim())
        : row.includes(";")
          ? row.split(";").map((item) => item.trim())
          : row.includes(" - ")
            ? row.split(" - ").map((item) => item.trim())
            : row.split(",").map((item) => item.trim());
      const [label = "", rawAmount = "", rawDescription = ""] = parts;
      const amount = rawAmount.replace(/[^\d]/g, "");
      const description = rawDescription || "за номер в сутки";
      return {
        label,
        amount: Number(amount),
        description
      };
    })
    .filter((item) => item.label && Number.isFinite(item.amount) && item.amount > 0);
}

export type ActionResult = { success: true } | { success: false; error: string };

export async function createLeadAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = leadSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Заполните обязательные поля" };
    }
    const { resortId, guestName, phone, note } = parsed.data;

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

    await notifyLeadToTelegram({
      leadId,
      resortTitle: resort?.title,
      guestName,
      phone,
      note
    });

    redirect(`/catalog?lead=success`);
    return { success: true };
  } catch (error) {
    console.error("createLeadAction error:", error);
    return { success: false, error: "Произошла ошибка при создании заявки" };
  }
}

export async function updateResortAction(formData: FormData) {
  const session = await requireRole("OWNER");
  const parsed = ownerResortFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const values = parsed.data;
  const id = values.id;
  const resort = await getResortByIdFromSupabase(id);

  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) return;

  const amenities = formData
    .getAll("amenities")
    .map((item) => String(item).trim())
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
  const accommodationTypes = formData
    .getAll("accommodationTypes")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const audience = formData
    .getAll("audience")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const includedItems = formData
    .getAll("includedItems")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const includedOther = String(formData.get("includedOther") || "").trim();
  const title = values.title?.trim() || "Без названия";
  const zone = values.zone?.trim() || "Алаколь";
  const foodOptions = values.foodOptions?.trim() || "Без питания";
  const accommodationType = accommodationTypes.length ? accommodationTypes.join(", ") : values.accommodationType || "Разные варианты размещения";
  const includedText = [...includedItems, includedOther].filter(Boolean).join(", ") || values.includedText || "";
  const hasAmenity = (label: string) => amenities.some((item) => item.toLowerCase() === label.toLowerCase());
  const generatedShortDescription =
    `${title} в ${zone}: ${accommodationType.toLowerCase()}, ${foodOptions.toLowerCase()}, ${values.distanceToLakeM} м до воды.`;
  const shortDescription = values.shortDescription?.trim() || generatedShortDescription;
  const description = values.description?.trim() || shortDescription;

  await updateResortRecordInSupabase(id, {
    ...resort,
    title,
    slug: slugify(title, resort.id),
    shortDescription,
    description,
    zone,
    address: values.address ?? "",
    minPrice: values.minPrice,
    maxPrice: values.maxPrice,
    foodOptions,
    accommodationType,
    contactPhone: values.contactPhone ?? "",
    whatsapp: values.whatsapp ?? "",
    latitude: values.latitude,
    longitude: values.longitude,
    distanceToLakeM: values.distanceToLakeM,
    familyFriendly: audience.includes("Семьям") || audience.includes("С детьми"),
    youthFriendly: audience.includes("Компаниям"),
    hasPool: hasAmenity("Бассейн"),
    hasWifi: hasAmenity("Wi-Fi"),
    hasParking: hasAmenity("Парковка"),
    hasKidsZone: hasAmenity("Детская зона") || audience.includes("С детьми"),
    includedText,
    rulesText: values.rulesText ?? "",
    beachLine: values.beachLine ?? "",
    transferInfo: values.transferInfo ?? "",
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
    unstable_rethrow(error);
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
  const parsed = ownerLeadUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { status, ownerComment } = parsed.data;
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
    const returnTo = String(formData.get("returnTo") || "/favorites");
    const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Заполните все поля отзыва" };
    }
    const { resortId, body, rating } = parsed.data;
    const authorName = session.user.name?.trim() || "Гость";
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
  const parsed = moderationReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, status } = parsed.data;
  await moderateReviewInSupabase(id, status);
  revalidatePath("/admin");
  revalidatePath("/catalog");
}

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = passwordResetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { email } = parsed.data;
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
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      redirect("/reset-password?error=1");
    }
    const { token, password } = parsed.data;
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
