export type UserRole = "OWNER" | "ADMIN" | "USER";

export type ResortStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

export const RESORT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED"
} as const;

export type LeadStatus = "new" | "contacted" | "no_answer" | "booked" | "closed";

export type NotificationType = "lead_created" | "resort_submitted" | "resort_published" | "resort_rejected" | "password_reset";

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  ownerProfileId: string | null;
  emailVerifiedAt?: Date | null;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
};

export type ResortOwnerProfile = {
  id: string;
  userId: string;
  company: string;
  phone: string;
  whatsapp: string;
};

export type ResortImage = {
  id: string;
  resortId: string;
  url: string;
  alt: string;
  sortOrder: number;
  kind: string;
  isCover: boolean;
};

export type ResortAmenity = {
  id: string;
  resortId: string;
  label: string;
};

export type ResortPrice = {
  id: string;
  resortId: string;
  label: string;
  amount: number;
  description: string;
};

export type Resort = {
  id: string;
  ownerProfileId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  address: string;
  zone: string;
  distanceToLakeM: number;
  latitude: number;
  longitude: number;
  minPrice: number;
  maxPrice: number;
  foodOptions: string;
  accommodationType: string;
  contactPhone: string;
  whatsapp: string;
  familyFriendly: boolean;
  youthFriendly: boolean;
  hasPool: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasKidsZone: boolean;
  isFeatured: boolean;
  status: ResortStatus;
  includedText: string;
  rulesText: string;
  beachLine: string;
  transferInfo: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: string;
  resortId: string;
  guestName: string;
  phone: string;
  note?: string;
  ownerComment?: string;
  status: LeadStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ModerationReview = {
  id: string;
  resortId: string;
  adminId?: string;
  action: string;
  comment?: string;
  createdAt: Date;
};

export type Review = {
  id: string;
  resortId: string;
  userId?: string | null;
  authorName: string;
  rating: number;
  body: string;
  status: "pending" | "approved";
  createdAt: Date;
};

export type Favorite = {
  id: string;
  userId: string;
  resortId: string;
  createdAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt: Date;
  readAt?: Date | null;
};

export type AnalyticsEvent = {
  id: string;
  eventType: string;
  resortId?: string;
  slug?: string;
  metadata?: string;
  createdAt: Date;
};

export type ResortWithRelations = Resort & {
  images: ResortImage[];
  amenities: ResortAmenity[];
  prices: ResortPrice[];
  ownerProfile?: ResortOwnerProfile;
  reviews: Review[];
  ratingAverage: number;
  approvedReviewsCount: number;
};

export type PendingResort = ResortWithRelations & {
  moderationReviews: ModerationReview[];
  completeness: {
    isReady: boolean;
    missing: string[];
  };
};

export type AuditItem = ModerationReview & {
  resort: { id: string; title: string };
  admin?: { name: string };
};

export type OwnerLead = Lead & {
  resort: { id: string; title: string; ownerProfileId: string };
};

export type UserReviewItem = Review & {
  resort: { id: string; title: string; slug: string };
};
