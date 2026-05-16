import { unstable_cache } from "next/cache";
import {
  getPublishedResortBySlugFromSupabase,
  listFeaturedResortsFromSupabase,
  listPublishedResortsFromSupabase,
  type ResortQueryFilters,
  type ResortWithRelations
} from "@/lib/supabase/resorts";
import {
  getPublishedResortBySlug as getFallbackResortBySlug,
  listFeaturedResorts as listFallbackFeaturedResorts,
  listPublishedResorts as listFallbackPublishedResorts
} from "@/lib/_dev-fallback-data";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

const getCachedPublishedResorts = unstable_cache(
  async (filters: ResortQueryFilters) => listPublishedResortsFromSupabase(filters),
  ["public-published-resorts"],
  { revalidate: 300, tags: ["public-resorts"] }
);

const getCachedFeaturedResorts = unstable_cache(
  async () => listFeaturedResortsFromSupabase(),
  ["public-featured-resorts"],
  { revalidate: 300, tags: ["public-resorts"] }
);

const getCachedResortBySlug = unstable_cache(
  async (slug: string) => getPublishedResortBySlugFromSupabase(slug),
  ["public-resort-by-slug"],
  { revalidate: 300, tags: ["public-resorts"] }
);

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

function filterFallbackResorts(filters: CatalogFilters) {
  const q = filters.q?.trim().toLowerCase();

  return listFallbackPublishedResorts().filter((resort) => {
    if (filters.zone && resort.zone !== filters.zone) return false;
    if (typeof filters.minPrice === "number" && resort.minPrice < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && resort.minPrice > filters.maxPrice) return false;
    if (filters.hasPool && !resort.hasPool) return false;
    if (filters.hasWifi && !resort.hasWifi) return false;
    if (filters.hasParking && !resort.hasParking) return false;
    if (filters.hasKidsZone && !resort.hasKidsZone) return false;
    if (filters.familyFriendly && !resort.familyFriendly) return false;
    if (filters.youthFriendly && !resort.youthFriendly) return false;
    if (q) {
      const haystack = [
        resort.title,
        resort.shortDescription,
        resort.zone,
        resort.foodOptions,
        resort.accommodationType
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function getCatalogResorts(filters: CatalogFilters): Promise<ResortWithRelations[]> {
  if (!isSupabaseAdminConfigured()) {
    return filterFallbackResorts(filters);
  }

  try {
    return await getCachedPublishedResorts(filters);
  } catch (error) {
    console.error("Failed to load catalog resorts", error);
    return [];
  }
}

export async function getFeaturedResorts(): Promise<ResortWithRelations[]> {
  if (!isSupabaseAdminConfigured()) {
    return listFallbackFeaturedResorts();
  }

  try {
    return await getCachedFeaturedResorts();
  } catch (error) {
    console.error("Failed to load featured resorts", error);
    return [];
  }
}

export async function getResortBySlug(slug: string): Promise<ResortWithRelations | null> {
  if (!isSupabaseAdminConfigured()) {
    return getFallbackResortBySlug(slug);
  }

  try {
    return await getCachedResortBySlug(slug);
  } catch (error) {
    console.error(`Failed to load resort by slug: ${slug}`, error);
    return null;
  }
}
