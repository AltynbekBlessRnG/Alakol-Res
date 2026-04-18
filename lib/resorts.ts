import {
  getPublishedResortBySlugFromSupabase,
  listFeaturedResortsFromSupabase,
  listPublishedResortsFromSupabase,
  type ResortWithRelations
} from "@/lib/supabase/resorts";

export type CatalogFilters = {
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

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): CatalogFilters {
  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const toNumber = (key: string) => {
    const value = getValue(key);
    if (!value) return undefined;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? undefined : numeric;
  };
  const toBoolean = (key: string) => (getValue(key) === "true" ? true : undefined);

  return {
    zone: getValue("zone") || undefined,
    minPrice: toNumber("minPrice"),
    maxPrice: toNumber("maxPrice"),
    hasPool: toBoolean("hasPool"),
    hasWifi: toBoolean("hasWifi"),
    hasParking: toBoolean("hasParking"),
    hasKidsZone: toBoolean("hasKidsZone"),
    familyFriendly: toBoolean("familyFriendly"),
    youthFriendly: toBoolean("youthFriendly"),
    q: getValue("q") || undefined
  };
}

function matchResort(resort: ResortWithRelations, filters: CatalogFilters) {
  const amenities = resort.amenities.map((item) => item.label.toLowerCase());
  const q = filters.q?.toLowerCase();

  if (resort.status !== "PUBLISHED") return false;
  if (filters.zone && resort.zone !== filters.zone) return false;
  if (filters.minPrice && resort.minPrice < filters.minPrice) return false;
  if (filters.maxPrice && resort.maxPrice > filters.maxPrice) return false;
  if (filters.hasPool && !resort.hasPool) return false;
  if (filters.hasWifi && !resort.hasWifi) return false;
  if (filters.hasParking && !resort.hasParking) return false;
  if (filters.hasKidsZone && !resort.hasKidsZone) return false;
  if (filters.familyFriendly && !resort.familyFriendly) return false;
  if (filters.youthFriendly && !resort.youthFriendly) return false;
  if (q) {
    const haystack = [resort.title, resort.shortDescription, resort.zone].join(" ").toLowerCase();
    if (!haystack.includes(q) && !amenities.some((item) => item.includes(q))) return false;
  }
  return true;
}

export async function getCatalogResorts(filters: CatalogFilters): Promise<ResortWithRelations[]> {
  const resorts = await listPublishedResortsFromSupabase();
  return resorts.filter((resort) => matchResort(resort, filters));
}

export async function getFeaturedResorts(): Promise<ResortWithRelations[]> {
  return listFeaturedResortsFromSupabase();
}

export async function getResortBySlug(slug: string): Promise<ResortWithRelations | null> {
  return getPublishedResortBySlugFromSupabase(slug);
}
