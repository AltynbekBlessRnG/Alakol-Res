import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type {
  AuditItem,
  Favorite,
  Lead,
  LeadStatus,
  Notification,
  NotificationType,
  OwnerLead,
  PasswordResetToken,
  PendingResort,
  ResortAmenity,
  ResortImage,
  ResortOwnerProfile,
  ResortPrice,
  Resort,
  ResortStatus,
  ResortWithRelations,
  Review,
  User,
  UserReviewItem
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublishedResortBySlugFromSupabase, hydrateResortRows, type ResortRow } from "@/lib/supabase/resorts";
import * as fallback from "@/lib/_dev-fallback-data";

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "OWNER" | "ADMIN" | "USER";
  email_verified_at?: string | null;
};

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  created_at: string;
  read_at: string | null;
};

type ReviewRow = {
  id: string;
  resort_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  body: string;
  status: "pending" | "approved";
  created_at: string;
};

type LeadRow = {
  id: string;
  resort_id: string;
  guest_name: string;
  phone: string;
  note: string | null;
  owner_comment: string | null;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

type FavoriteRow = {
  id: string;
  user_id: string;
  resort_id: string;
  created_at: string;
};

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

type ModerationReviewRow = {
  id: string;
  resort_id: string;
  admin_id: string | null;
  action: string;
  comment: string | null;
  created_at: string;
};

type OwnerProfileRow = {
  id: string;
  user_id: string;
  company: string;
  phone: string;
  whatsapp: string;
};

type AnalyticsEventRow = {
  id: string;
  event_type: string;
  resort_id: string | null;
  slug: string | null;
  metadata: string | null;
  created_at: string;
};

function createId(prefix: string) {
  return `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function mapUser(row: UserRow, ownerProfileId: string | null = null): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    role: row.role,
    ownerProfileId,
    emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at) : null
  };
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href ?? undefined,
    createdAt: new Date(row.created_at),
    readAt: row.read_at ? new Date(row.read_at) : null
  };
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    resortId: row.resort_id,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    status: row.status,
    createdAt: new Date(row.created_at)
  };
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    resortId: row.resort_id,
    guestName: row.guest_name,
    phone: row.phone,
    note: row.note ?? undefined,
    ownerComment: row.owner_comment ?? undefined,
    status: row.status,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapPasswordResetToken(row: PasswordResetTokenRow): PasswordResetToken {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    usedAt: row.used_at ? new Date(row.used_at) : null
  };
}

function mapResortRow(row: ResortRow): Resort {
  return {
    id: row.id,
    ownerProfileId: row.owner_profile_id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    address: row.address,
    zone: row.zone,
    distanceToLakeM: row.distance_to_lake_m,
    latitude: row.latitude,
    longitude: row.longitude,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    foodOptions: row.food_options,
    accommodationType: row.accommodation_type,
    contactPhone: row.contact_phone,
    whatsapp: row.whatsapp,
    familyFriendly: row.family_friendly,
    youthFriendly: row.youth_friendly,
    hasPool: row.has_pool,
    hasWifi: row.has_wifi,
    hasParking: row.has_parking,
    hasKidsZone: row.has_kids_zone,
    isFeatured: row.is_featured,
    status: row.status,
    includedText: row.included_text,
    rulesText: row.rules_text,
    beachLine: row.beach_line,
    transferInfo: row.transfer_info,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

async function getOwnerProfileIdForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("owner_profiles").select("id").eq("user_id", userId).maybeSingle();
  return data?.id ?? null;
}

export async function getUserByEmailFromSupabase(email: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.getUserByEmail(email);

  const { data } = await supabase.from("users").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (!data) return null;
  const ownerProfileId = data.role === "OWNER" ? await getOwnerProfileIdForUser(data.id) : null;
  return mapUser(data as UserRow, ownerProfileId);
}

export async function getUserByIdFromSupabase(id: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.getUserById(id);

  const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const ownerProfileId = data.role === "OWNER" ? await getOwnerProfileIdForUser(data.id) : null;
  return mapUser(data as UserRow, ownerProfileId);
}

export function verifyPasswordAgainstSupabaseUser(user: User, password: string) {
  if (user.id.startsWith("user-")) {
    return fallback.verifyPassword(user, password);
  }
  return bcrypt.compareSync(password, user.passwordHash);
}

export async function createUserInSupabase(input: {
  email: string;
  name: string;
  password: string;
  role?: "USER" | "OWNER" | "ADMIN";
  ownerProfile?: {
    company: string;
    phone: string;
    whatsapp: string;
  };
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false as const, reason: "unavailable" as const };

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const ownerProfile = input.ownerProfile
    ? {
        company: input.ownerProfile.company.trim(),
        phone: input.ownerProfile.phone.trim(),
        whatsapp: input.ownerProfile.whatsapp.trim()
      }
    : null;

  if (!email || !name || input.password.length < 8) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const existing = await getUserByEmailFromSupabase(email);
  if (existing) {
    return { ok: false as const, reason: "exists" as const };
  }

  const id = createId("user");
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(input.password, 10);
  const role = input.role ?? "USER";
  const ownerProfileId = role === "OWNER" ? createId("owner-profile") : null;

  if (role === "OWNER" && (!ownerProfile || !ownerProfile.company || !ownerProfile.phone || !ownerProfile.whatsapp)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const { error } = await supabase.from("users").insert({
    id,
    email,
    name,
    password_hash: passwordHash,
    role,
    ...(role === "OWNER" ? {} : {}),
    created_at: now,
    updated_at: now
  });

  if (error) {
    return { ok: false as const, reason: "insert_failed" as const };
  }

  if (role === "OWNER" && ownerProfileId && ownerProfile) {
    const { error: ownerError } = await supabase.from("owner_profiles").insert({
      id: ownerProfileId,
      user_id: id,
      company: ownerProfile.company,
      phone: ownerProfile.phone,
      whatsapp: ownerProfile.whatsapp,
      created_at: now,
      updated_at: now
    });

    if (ownerError) {
      await supabase.from("users").delete().eq("id", id);
      return { ok: false as const, reason: "insert_failed" as const };
    }
  }

  return {
    ok: true as const,
    user: {
      id,
      email,
      name,
      passwordHash,
      role,
      ownerProfileId,
      emailVerifiedAt: null
    } satisfies User
  };
}

export async function listNotificationsFromSupabase(userId: string, limit = 8) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listNotifications(userId, limit);
  const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  return ((data as NotificationRow[] | null) ?? []).map(mapNotification);
}

export async function createNotificationInSupabase(input: { userId: string; type: NotificationType; title: string; body: string; href?: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.createNotification(input);
  const payload = {
    id: createId("notification"),
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href ?? null
  };
  await supabase.from("notifications").insert(payload);
  return payload.id;
}

export async function toggleFavoriteForUserInSupabase(userId: string, resortId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.toggleFavoriteForUser(userId, resortId);
  const { data: existing } = await supabase.from("favorites").select("id").eq("user_id", userId).eq("resort_id", resortId).maybeSingle();
  if (existing?.id) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("favorites").insert({
    id: createId("favorite"),
    user_id: userId,
    resort_id: resortId
  });
  return true;
}

export async function listUserFavoriteResortsFromSupabase(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listUserFavoriteResorts(userId);
  const { data } = await supabase.from("favorites").select("resort_id").eq("user_id", userId).order("created_at", { ascending: false });
  const resortIds = ((data as Array<{ resort_id: string }> | null) ?? []).map((item) => item.resort_id);
  if (!resortIds.length) return [];
  const resorts = await listResortsByIdsFromSupabase(resortIds);
  return resortIds.map((id) => resorts.find((resort) => resort.id === id)).filter(Boolean) as ResortWithRelations[];
}

export async function listUserReviewsFromSupabase(userId: string): Promise<UserReviewItem[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listUserReviews(userId);
  const { data: reviews } = await supabase.from("reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const rows = (reviews as ReviewRow[] | null) ?? [];
  if (!rows.length) return [];
  const resortIds = [...new Set(rows.map((row) => row.resort_id))];
  const resorts = await listResortsByIdsFromSupabase(resortIds);
  return rows.map((row) => {
    const resort = resorts.find((item) => item.id === row.resort_id);
    return {
      ...mapReview(row),
      resort: {
        id: resort?.id ?? row.resort_id,
        title: resort?.title ?? "Объект",
        slug: resort?.slug ?? ""
      }
    };
  });
}

export async function createReviewInSupabase(input: { resortId: string; userId?: string | null; authorName: string; body: string; rating: number }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.createReview(input);
  const id = createId("review");
  await supabase.from("reviews").insert({
    id,
    resort_id: input.resortId,
    user_id: input.userId ?? null,
    author_name: input.authorName,
    body: input.body,
    rating: input.rating,
    status: "approved"
  });
  return id;
}

export async function moderateReviewInSupabase(id: string, status: "approved" | "pending") {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.moderateReview(id, status);
  await supabase.from("reviews").update({ status }).eq("id", id);
}

export async function listPendingReviewsFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listPendingReviews();
  const { data: reviews } = await supabase.from("reviews").select("*").eq("status", "pending").order("created_at", { ascending: false });
  const rows = (reviews as ReviewRow[] | null) ?? [];
  const resortIds = [...new Set(rows.map((row) => row.resort_id))];
  const resorts = await listResortsByIdsFromSupabase(resortIds);
  return rows.map((row) => ({
    ...mapReview(row),
    resortTitle: resorts.find((item) => item.id === row.resort_id)?.title ?? "Объект"
  }));
}

export async function createLeadInSupabase(input: { resortId: string; guestName: string; phone: string; note?: string; source?: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.createLead(input);
  const id = createId("lead");
  await supabase.from("leads").insert({
    id,
    resort_id: input.resortId,
    guest_name: input.guestName,
    phone: input.phone,
    note: input.note ?? null,
    source: input.source ?? "site_form",
    status: "new"
  });
  return id;
}

export async function updateLeadInSupabase(id: string, input: { status: LeadStatus; ownerComment?: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.updateLead(id, input);
  await supabase.from("leads").update({ status: input.status, owner_comment: input.ownerComment ?? null, updated_at: new Date().toISOString() }).eq("id", id);
}

async function listResortsByIdsFromSupabase(ids: string[]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !ids.length) return [];
  const { data } = await supabase.from("resorts").select("*").in("id", ids);
  const rows = (data as ResortRow[] | null) ?? [];
  const resorts = await hydrateResortRows(rows);
  return ids.map((id) => resorts.find((resort) => resort.id === id)).filter(Boolean) as ResortWithRelations[];
}

export async function listAllPublishedSlugsFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("resorts").select("slug").eq("status", "PUBLISHED").order("title", { ascending: true });
  return ((data as Array<{ slug: string }> | null) ?? []);
}

export async function getResortByIdFromSupabase(id: string): Promise<ResortWithRelations | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    const resort = fallback.getResortById(id);
    return resort ? fallback.enrichResort(resort) : null;
  }
  const { data } = await supabase.from("resorts").select("*").eq("id", id).maybeSingle();
  const row = data as ResortRow | null;
  if (!row) return null;
  const hydrated = await hydrateResortRows([row]);
  return hydrated[0] ?? null;
}

export async function listOwnerResortsFromSupabase(ownerProfileId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listOwnerResorts(ownerProfileId);
  const { data } = await supabase.from("resorts").select("*").eq("owner_profile_id", ownerProfileId).order("updated_at", { ascending: false });
  return ((data as ResortRow[] | null) ?? []).map(mapResortRow);
}

export async function listOwnerLeadsFromSupabase(ownerProfileId: string, filters?: { status?: LeadStatus | "all"; q?: string }): Promise<OwnerLead[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listOwnerLeads(ownerProfileId, filters);
  const { data: resorts } = await supabase.from("resorts").select("id,title,owner_profile_id").eq("owner_profile_id", ownerProfileId);
  const resortRows = (resorts as Array<{ id: string; title: string; owner_profile_id: string }> | null) ?? [];
  const resortIds = resortRows.map((item) => item.id);
  if (!resortIds.length) return [];
  const { data: leads } = await supabase.from("leads").select("*").in("resort_id", resortIds).order("created_at", { ascending: false });
  return ((leads as LeadRow[] | null) ?? [])
    .map((row) => ({
      ...mapLead(row),
      resort: {
        id: row.resort_id,
        title: resortRows.find((resort) => resort.id === row.resort_id)?.title ?? "Объект",
        ownerProfileId
      }
    }))
    .filter((lead) => (filters?.status && filters.status !== "all" ? lead.status === filters.status : true))
    .filter((lead) => {
      if (!filters?.q) return true;
      const q = filters.q.toLowerCase();
      return [lead.guestName, lead.phone, lead.resort.title, lead.note ?? "", lead.ownerComment ?? ""].join(" ").toLowerCase().includes(q);
    });
}

export async function listPendingResortsFromSupabase(): Promise<PendingResort[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listPendingResorts();
  const { data } = await supabase.from("resorts").select("*").in("status", ["PENDING_REVIEW", "REJECTED"]).order("updated_at", { ascending: false });
  const valid = await hydrateResortRows((data as ResortRow[] | null) ?? []);
  return Promise.all(valid.map(async (resort) => ({
    ...resort,
    moderationReviews: await listModerationReviewsByResortFromSupabase(resort.id),
    completeness: getResortCompleteness(resort)
  })));
}

export async function listModerationReviewsByResortFromSupabase(resortId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listModerationReviewsByResort(resortId);
  const { data } = await supabase.from("moderation_reviews").select("*").eq("resort_id", resortId).order("created_at", { ascending: false });
  return ((data as ModerationReviewRow[] | null) ?? []).map((row) => ({
    id: row.id,
    resortId: row.resort_id,
    adminId: row.admin_id ?? undefined,
    action: row.action,
    comment: row.comment ?? undefined,
    createdAt: new Date(row.created_at)
  }));
}

export async function listAuditFromSupabase(limit = 8): Promise<AuditItem[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listAudit(limit);
  const { data } = await supabase.from("moderation_reviews").select("*").order("created_at", { ascending: false }).limit(limit);
  const rows = (data as ModerationReviewRow[] | null) ?? [];
  const resortIds = [...new Set(rows.map((row) => row.resort_id))];
  const adminIds = [...new Set(rows.map((row) => row.admin_id).filter(Boolean))] as string[];
  const [resorts, admins] = await Promise.all([
    listResortsByIdsFromSupabase(resortIds),
    adminIds.length ? createSupabaseAdminClient()!.from("users").select("id,name").in("id", adminIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string }> })
  ]);
  const adminMap = new Map((((admins.data as Array<{ id: string; name: string }> | null) ?? []).map((item) => [item.id, item.name])));
  return rows.map((row) => ({
    id: row.id,
    resortId: row.resort_id,
    adminId: row.admin_id ?? undefined,
    action: row.action,
    comment: row.comment ?? undefined,
    createdAt: new Date(row.created_at),
    resort: {
      id: row.resort_id,
      title: resorts.find((resort) => resort.id === row.resort_id)?.title ?? "Объект"
    },
    admin: row.admin_id ? { name: adminMap.get(row.admin_id) ?? "Администратор" } : undefined
  }));
}

export async function listIncompleteResortsFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listIncompleteResorts();
  const { data } = await supabase.from("resorts").select("*").order("updated_at", { ascending: false });
  const resorts = await hydrateResortRows((data as ResortRow[] | null) ?? []);
  return resorts
    .map((resort) => ({ ...resort, completeness: getResortCompleteness(resort) }))
    .filter((resort) => !resort.completeness.isReady);
}

export async function listAnalyticsSummaryFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.listAnalyticsSummary();
  const [leads, published, owners, resorts] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("resorts").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    supabase.from("owner_profiles").select("id", { count: "exact", head: true }),
    supabase.from("resorts").select("id,title")
  ]);
  let analyticsRows: AnalyticsEventRow[] = [];
  try {
    const { data } = await supabase.from("analytics_events").select("*").limit(500);
    analyticsRows = (data as AnalyticsEventRow[] | null) ?? [];
  } catch {
    analyticsRows = [];
  }

  const resortRows = (resorts.data as Array<{ id: string; title: string }> | null) ?? [];
  const { data: allLeads } = await supabase.from("leads").select("resort_id");
  const leadCounts = new Map<string, number>();
  (((allLeads as Array<{ resort_id: string }> | null) ?? [])).forEach((lead) => {
    leadCounts.set(lead.resort_id, (leadCounts.get(lead.resort_id) ?? 0) + 1);
  });
  const topResorts = resortRows
    .map((row) => ({ title: row.title, leadsCount: leadCounts.get(row.id) ?? 0 }))
    .sort((a, b) => b.leadsCount - a.leadsCount || a.title.localeCompare(b.title))
    .slice(0, 5);

  const eventCountsMap = new Map<string, number>();
  analyticsRows.forEach((item) => {
    eventCountsMap.set(item.event_type, (eventCountsMap.get(item.event_type) ?? 0) + 1);
  });

  return {
    totalLeads: leads.count ?? 0,
    totalPublished: published.count ?? 0,
    totalOwners: owners.count ?? 0,
    topResorts,
    eventCounts: [...eventCountsMap.entries()].map(([eventType, count]) => ({ eventType, count }))
  };
}

export async function createAnalyticsEventInSupabase(input: { eventType: string; resortId?: string; slug?: string; metadata?: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.createAnalyticsEvent(input);
  try {
    const id = createId("event");
    await supabase.from("analytics_events").insert({
      id,
      event_type: input.eventType,
      resort_id: input.resortId ?? null,
      slug: input.slug ?? null,
      metadata: input.metadata ?? null,
      created_at: new Date().toISOString()
    });
    return id;
  } catch {
    return null;
  }
}

export async function createPasswordResetTokenInSupabase(email: string) {
  if (!createSupabaseAdminClient()) return fallback.createPasswordResetToken(email);
  const user = await getUserByEmailFromSupabase(email);
  if (!user) return null;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const token = randomUUID();
  const id = createId("reset");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  await supabase.from("password_reset_tokens").insert({
    id,
    user_id: user.id,
    token,
    expires_at: expiresAt
  });
  return token;
}

export async function getValidPasswordResetTokenFromSupabase(token: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.getValidPasswordResetToken(token);
  const { data } = await supabase.from("password_reset_tokens").select("*").eq("token", token).maybeSingle();
  const row = data as PasswordResetTokenRow | null;
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return null;
  return mapPasswordResetToken(row);
}

export async function markPasswordResetTokenUsedInSupabase(id: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.markPasswordResetTokenUsed(id);
  await supabase.from("password_reset_tokens").update({ used_at: new Date().toISOString() }).eq("id", id);
}

export async function updateUserPasswordInSupabase(userId: string, password: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.updateUserPassword(userId, password);
  await supabase.from("users").update({ password_hash: bcrypt.hashSync(password, 10) }).eq("id", userId);
}

export async function appendResortImagesInSupabase(resortId: string, urls: string[]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.appendResortImages(resortId, urls);
  if (!urls.length) return;
  const { data: current } = await supabase.from("resort_images").select("sort_order").eq("resort_id", resortId).order("sort_order", { ascending: false }).limit(1);
  let nextOrder = (((current as Array<{ sort_order: number }> | null) ?? [])[0]?.sort_order ?? -1) + 1;
  await supabase.from("resort_images").insert(
    urls.map((url) => ({
      id: createId("img"),
      resort_id: resortId,
      url,
      alt: "Фото зоны отдыха",
      sort_order: nextOrder++,
      kind: "gallery"
    }))
  );
}

export async function replaceResortImagesInSupabase(resortId: string, images: Array<{ url: string; kind: string }>) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.replaceResortImages(resortId, images);
  await supabase.from("resort_images").delete().eq("resort_id", resortId);
  if (!images.length) return;
  await supabase.from("resort_images").insert(
    images.map((image, index) => ({
      id: createId("img"),
      resort_id: resortId,
      url: image.url,
      alt: index === 0 ? "Основное фото зоны отдыха" : "Фото зоны отдыха",
      sort_order: index,
      kind: image.kind
    }))
  );
}

export async function replaceResortAmenitiesInSupabase(resortId: string, amenities: string[]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.replaceResortAmenities(resortId, amenities);
  await supabase.from("resort_amenities").delete().eq("resort_id", resortId);
  if (!amenities.length) return;
  await supabase.from("resort_amenities").insert(
    amenities.map((label) => ({
      id: createId("amenity"),
      resort_id: resortId,
      label
    }))
  );
}

export async function replaceResortPricesInSupabase(
  resortId: string,
  prices: Array<{ label: string; amount: number; description: string }>
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase.from("resort_prices").delete().eq("resort_id", resortId);
  if (!prices.length) return;
  await supabase.from("resort_prices").insert(
    prices.map((price) => ({
      id: createId("price"),
      resort_id: resortId,
      label: price.label,
      amount: price.amount,
      description: price.description
    }))
  );
}

export async function addModerationReviewInSupabase(input: { resortId: string; adminId?: string; action: string; comment?: string }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.addModerationReview(input);
  await supabase.from("moderation_reviews").insert({
    id: createId("audit"),
    resort_id: input.resortId,
    admin_id: input.adminId ?? null,
    action: input.action,
    comment: input.comment ?? null
  });
}

export async function setResortFeaturedInSupabase(id: string, featured: boolean) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.setResortFeatured(id, featured);
  await supabase.from("resorts").update({ is_featured: featured, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function updateResortRecordInSupabase(id: string, resort: Resort) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.updateResortRecord(id, resort);
  await supabase.from("resorts").update({
    owner_profile_id: resort.ownerProfileId,
    title: resort.title,
    slug: resort.slug,
    short_description: resort.shortDescription,
    description: resort.description,
    address: resort.address,
    zone: resort.zone,
    distance_to_lake_m: resort.distanceToLakeM,
    latitude: resort.latitude,
    longitude: resort.longitude,
    min_price: resort.minPrice,
    max_price: resort.maxPrice,
    food_options: resort.foodOptions,
    accommodation_type: resort.accommodationType,
    contact_phone: resort.contactPhone,
    whatsapp: resort.whatsapp,
    family_friendly: resort.familyFriendly,
    youth_friendly: resort.youthFriendly,
    has_pool: resort.hasPool,
    has_wifi: resort.hasWifi,
    has_parking: resort.hasParking,
    has_kids_zone: resort.hasKidsZone,
    included_text: resort.includedText,
    rules_text: resort.rulesText,
    beach_line: resort.beachLine,
    transfer_info: resort.transferInfo,
    is_featured: resort.isFeatured,
    status: resort.status,
    updated_at: resort.updatedAt.toISOString()
  }).eq("id", id);
}

export async function createDraftResortInSupabase(ownerProfileId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback.createDraftResort(ownerProfileId);
  const id = createId("resort");
  const now = new Date().toISOString();
  await supabase.from("resorts").insert({
    id,
    owner_profile_id: ownerProfileId,
    title: "",
    slug: `resort-${id}`,
    short_description: "",
    description: "",
    address: "",
    zone: "Алаколь",
    distance_to_lake_m: 0,
    latitude: 46.1,
    longitude: 81.6,
    min_price: 0,
    max_price: 0,
    food_options: "",
    accommodation_type: "",
    contact_phone: "",
    whatsapp: "",
    family_friendly: false,
    youth_friendly: false,
    has_pool: false,
    has_wifi: false,
    has_parking: false,
    has_kids_zone: false,
    included_text: "",
    rules_text: "",
    beach_line: "",
    transfer_info: "",
    is_featured: false,
    status: "DRAFT",
    created_at: now,
    updated_at: now
  });
  return id;
}

export function getResortCompleteness(resort: ResortWithRelations | Resort) {
  const base = "images" in resort ? resort as ResortWithRelations : {
    ...resort,
    images: [] as ResortImage[],
    amenities: [] as ResortAmenity[],
    prices: [] as ResortPrice[],
    reviews: [] as Review[],
    ratingAverage: 0,
    approvedReviewsCount: 0
  } as ResortWithRelations;

  const missing: string[] = [];
  if (!base.images.length || !base.images.some((image) => image.isCover || image.kind === "cover")) missing.push("cover-фото");
  if (base.images.length < 3) missing.push("минимум 3 фото");
  if (!base.includedText.trim()) missing.push("что включено в цену");
  if (!base.rulesText.trim()) missing.push("правила проживания");
  if (!base.beachLine.trim()) missing.push("описание берега");
  if (!base.contactPhone.trim() || base.contactPhone.trim().length < 7) missing.push("рабочий телефон");
  if (!base.whatsapp.trim() || base.whatsapp.trim().length < 7) missing.push("WhatsApp");
  if (!base.address.trim()) missing.push("адрес");
  if (base.prices.length === 0) missing.push("ценовые пакеты");
  if (base.amenities.length < 3) missing.push("хотя бы 3 удобства");
  return { isReady: missing.length === 0, missing };
}
