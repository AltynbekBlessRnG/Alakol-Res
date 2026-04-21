import type { ResortImage, ResortAmenity, ResortPrice, ResortWithRelations, Review, ResortOwnerProfile } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type { ResortWithRelations } from "@/lib/types";

export type ResortQueryFilters = {
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  hasPool?: boolean;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasKidsZone?: boolean;
  familyFriendly?: boolean;
  youthFriendly?: boolean;
  q?: string;
};

export type ResortRow = {
  id: string;
  owner_profile_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  address: string;
  zone: string;
  distance_to_lake_m: number;
  latitude: number;
  longitude: number;
  min_price: number;
  max_price: number;
  food_options: string;
  accommodation_type: string;
  contact_phone: string;
  whatsapp: string;
  family_friendly: boolean;
  youth_friendly: boolean;
  has_pool: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  has_kids_zone: boolean;
  is_featured: boolean;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  included_text: string;
  rules_text: string;
  beach_line: string;
  transfer_info: string;
  created_at: string;
  updated_at: string;
};

type ResortImageRow = {
  id: string;
  resort_id: string;
  url: string;
  alt: string;
  sort_order: number;
  kind: string;
};

type ResortAmenityRow = {
  id: string;
  resort_id: string;
  label: string;
};

type ResortPriceRow = {
  id: string;
  resort_id: string;
  label: string;
  amount: number;
  description: string;
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

type OwnerProfileRow = {
  id: string;
  user_id: string;
  company: string;
  phone: string;
  whatsapp: string;
};

function mapResort(row: ResortRow): ResortWithRelations {
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
    includedText: row.included_text ?? "",
    rulesText: row.rules_text ?? "",
    beachLine: row.beach_line ?? "",
    transferInfo: row.transfer_info ?? "",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    images: [],
    amenities: [],
    prices: [],
    reviews: [],
    ratingAverage: 0,
    approvedReviewsCount: 0
  };
}

function mapImage(row: ResortImageRow): ResortImage {
  return {
    id: row.id,
    resortId: row.resort_id,
    url: row.url,
    alt: row.alt,
    sortOrder: row.sort_order,
    kind: row.kind,
    isCover: row.kind === "cover" || row.sort_order === 0
  };
}

function mapAmenity(row: ResortAmenityRow): ResortAmenity {
  return {
    id: row.id,
    resortId: row.resort_id,
    label: row.label
  };
}

function mapPrice(row: ResortPriceRow): ResortPrice {
  return {
    id: row.id,
    resortId: row.resort_id,
    label: row.label,
    amount: row.amount,
    description: row.description
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

function mapOwnerProfile(row: OwnerProfileRow): ResortOwnerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    company: row.company,
    phone: row.phone,
    whatsapp: row.whatsapp
  };
}

function withRating(resort: ResortWithRelations) {
  const approvedReviewsCount = resort.reviews.length;
  const ratingAverage = approvedReviewsCount
    ? Number((resort.reviews.reduce((sum, item) => sum + item.rating, 0) / approvedReviewsCount).toFixed(1))
    : 0;

  return {
    ...resort,
    ratingAverage,
    approvedReviewsCount
  };
}

function buildPublishedResortsQuery(filters: ResortQueryFilters = {}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  let query = supabase
    .from("resorts")
    .select("*")
    .eq("status", "PUBLISHED");

  if (filters.zone) query = query.eq("zone", filters.zone);
  if (typeof filters.minPrice === "number") query = query.gte("min_price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("max_price", filters.maxPrice);
  if (filters.hasPool) query = query.eq("has_pool", true);
  if (filters.hasWifi) query = query.eq("has_wifi", true);
  if (filters.hasParking) query = query.eq("has_parking", true);
  if (filters.hasKidsZone) query = query.eq("has_kids_zone", true);
  if (filters.familyFriendly) query = query.eq("family_friendly", true);
  if (filters.youthFriendly) query = query.eq("youth_friendly", true);
  if (filters.q?.trim()) {
    const safe = filters.q.trim().replace(/[%_]/g, "");
    query = query.or(
      `title.ilike.%${safe}%,short_description.ilike.%${safe}%,zone.ilike.%${safe}%,food_options.ilike.%${safe}%,accommodation_type.ilike.%${safe}%`
    );
  }

  return query;
}

async function hydrateResortSummaries(rows: ResortRow[]): Promise<ResortWithRelations[]> {
  if (!rows.length) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const resortIds = rows.map((row) => row.id);
  const [{ data: images }, { data: amenities }, { data: reviews }] = await Promise.all([
    supabase.from("resort_images").select("id,resort_id,url,alt,sort_order,kind").in("resort_id", resortIds).order("sort_order", { ascending: true }),
    supabase.from("resort_amenities").select("id,resort_id,label").in("resort_id", resortIds),
    supabase.from("reviews").select("resort_id,rating").in("resort_id", resortIds).eq("status", "approved")
  ]);

  const imageMap = new Map<string, ResortImage[]>();
  (images as ResortImageRow[] | null | undefined)?.forEach((row) => {
    const item = mapImage(row);
    const existing = imageMap.get(item.resortId) ?? [];
    imageMap.set(item.resortId, existing.length ? existing : [item]);
  });

  const amenityMap = new Map<string, ResortAmenity[]>();
  (amenities as ResortAmenityRow[] | null | undefined)?.forEach((row) => {
    const item = mapAmenity(row);
    amenityMap.set(item.resortId, [...(amenityMap.get(item.resortId) ?? []), item]);
  });

  const reviewStats = new Map<string, { total: number; count: number }>();
  ((reviews as Array<{ resort_id: string; rating: number }> | null | undefined) ?? []).forEach((row) => {
    const current = reviewStats.get(row.resort_id) ?? { total: 0, count: 0 };
    reviewStats.set(row.resort_id, { total: current.total + row.rating, count: current.count + 1 });
  });

  return rows.map((row) => {
    const stats = reviewStats.get(row.id) ?? { total: 0, count: 0 };
    const ratingAverage = stats.count ? Number((stats.total / stats.count).toFixed(1)) : 0;

    return {
      ...mapResort(row),
      images: imageMap.get(row.id) ?? [],
      amenities: amenityMap.get(row.id) ?? [],
      prices: [],
      reviews: [],
      ratingAverage,
      approvedReviewsCount: stats.count
    };
  });
}

export async function hydrateResortRows(rows: ResortRow[]): Promise<ResortWithRelations[]> {
  if (!rows.length) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const resortIds = rows.map((row) => row.id);
  const ownerProfileIds = [...new Set(rows.map((row) => row.owner_profile_id))];

  const [{ data: images }, { data: amenities }, { data: prices }, { data: reviews }, { data: ownerProfiles }] = await Promise.all([
    supabase.from("resort_images").select("*").in("resort_id", resortIds).order("sort_order", { ascending: true }),
    supabase.from("resort_amenities").select("*").in("resort_id", resortIds),
    supabase.from("resort_prices").select("*").in("resort_id", resortIds).order("amount", { ascending: true }),
    supabase.from("reviews").select("*").in("resort_id", resortIds).eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("owner_profiles").select("*").in("id", ownerProfileIds)
  ]);

  const imageMap = new Map<string, ResortImage[]>();
  (images as ResortImageRow[] | null | undefined)?.forEach((row) => {
    const item = mapImage(row);
    imageMap.set(item.resortId, [...(imageMap.get(item.resortId) ?? []), item]);
  });

  const amenityMap = new Map<string, ResortAmenity[]>();
  (amenities as ResortAmenityRow[] | null | undefined)?.forEach((row) => {
    const item = mapAmenity(row);
    amenityMap.set(item.resortId, [...(amenityMap.get(item.resortId) ?? []), item]);
  });

  const priceMap = new Map<string, ResortPrice[]>();
  (prices as ResortPriceRow[] | null | undefined)?.forEach((row) => {
    const item = mapPrice(row);
    priceMap.set(item.resortId, [...(priceMap.get(item.resortId) ?? []), item]);
  });

  const reviewMap = new Map<string, Review[]>();
  (reviews as ReviewRow[] | null | undefined)?.forEach((row) => {
    const item = mapReview(row);
    reviewMap.set(item.resortId, [...(reviewMap.get(item.resortId) ?? []), item]);
  });

  const ownerProfileMap = new Map<string, ResortOwnerProfile>();
  (ownerProfiles as OwnerProfileRow[] | null | undefined)?.forEach((row) => {
    ownerProfileMap.set(row.id, mapOwnerProfile(row));
  });

  return rows.map((row) =>
    withRating({
      ...mapResort(row),
      images: imageMap.get(row.id) ?? [],
      amenities: amenityMap.get(row.id) ?? [],
      prices: priceMap.get(row.id) ?? [],
      reviews: reviewMap.get(row.id) ?? [],
      ownerProfile: ownerProfileMap.get(row.owner_profile_id)
    })
  );
}

export async function listPublishedResortsFromSupabase(filters: ResortQueryFilters = {}) {
  const query = buildPublishedResortsQuery(filters);
  if (!query) return [];

  const { data, error } = await query.order("is_featured", { ascending: false }).order("min_price", { ascending: true });

  if (error) {
    throw error;
  }

  return hydrateResortSummaries((data as ResortRow[]) ?? []);
}

export async function listFeaturedResortsFromSupabase() {
  const query = buildPublishedResortsQuery();
  if (!query) return [];

  const { data, error } = await query.eq("is_featured", true).order("min_price", { ascending: true }).limit(6);

  if (error) {
    throw error;
  }

  return hydrateResortSummaries((data as ResortRow[]) ?? []);
}

export async function getPublishedResortBySlugFromSupabase(slug: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("resorts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  const resorts = await hydrateResortRows([data as ResortRow]);
  return resorts[0] ?? null;
}
