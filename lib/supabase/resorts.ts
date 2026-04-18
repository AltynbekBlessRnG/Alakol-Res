import type { ResortAmenity, ResortImage, ResortOwnerProfile, ResortPrice, ResortWithRelations, Review } from "@/lib/demo-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type { ResortWithRelations } from "@/lib/demo-data";

type ResortRow = {
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

async function hydrateResorts(rows: ResortRow[]): Promise<ResortWithRelations[]> {
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

export async function listPublishedResortsFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("resorts")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("is_featured", { ascending: false })
    .order("min_price", { ascending: true });

  if (error) {
    throw error;
  }

  return hydrateResorts((data as ResortRow[]) ?? []);
}

export async function listFeaturedResortsFromSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("resorts")
    .select("*")
    .eq("status", "PUBLISHED")
    .eq("is_featured", true)
    .order("min_price", { ascending: true })
    .limit(6);

  if (error) {
    throw error;
  }

  return hydrateResorts((data as ResortRow[]) ?? []);
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

  const resorts = await hydrateResorts([data as ResortRow]);
  return resorts[0] ?? null;
}
