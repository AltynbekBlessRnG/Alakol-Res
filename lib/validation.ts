import { z } from "zod";

export const leadSchema = z.object({
  resortId: z.string().trim().min(1, "Не указан объект"),
  guestName: z.string().trim().min(2, "Укажите имя"),
  phone: z.string().trim().min(5, "Укажите телефон"),
  note: z.string().trim().max(1000).optional().or(z.literal(""))
});

export const reviewSchema = z.object({
  resortId: z.string().trim().min(1, "Не указан объект"),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(3, "Напишите отзыв").max(2000)
});

export const ownerLeadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "no_answer", "booked", "closed"]),
  ownerComment: z.string().trim().max(2000).optional().or(z.literal(""))
});

export const adminResortActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("featured"),
    featured: z.boolean()
  }),
  z.object({
    type: z.literal("moderation"),
    action: z.enum(["publish", "reject"]),
    comment: z.string().trim().max(2000).optional().or(z.literal(""))
  })
]);

export const moderationReviewSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["approved", "pending"])
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8)
});

export const resortUploadSchema = z.object({
  resortId: z.string().trim().regex(/^[a-zA-Z0-9_-]+$/, "Invalid resortId")
});

export const ownerResortFormSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  zone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  minPrice: z.coerce.number().int().positive(),
  maxPrice: z.coerce.number().int().positive(),
  foodOptions: z.string().trim().min(1),
  accommodationType: z.string().trim().min(1),
  contactPhone: z.string().trim().min(5),
  whatsapp: z.string().trim().min(5),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  distanceToLakeM: z.coerce.number().int().nonnegative(),
  includedText: z.string().trim().optional().or(z.literal("")),
  rulesText: z.string().trim().optional().or(z.literal("")),
  beachLine: z.string().trim().optional().or(z.literal("")),
  transferInfo: z.string().trim().optional().or(z.literal(""))
}).refine((value) => value.maxPrice >= value.minPrice, {
  message: "Максимальная цена должна быть больше минимальной",
  path: ["maxPrice"]
});

