import { unstable_cache } from "next/cache";
import {
  getPublishedResortBySlugFromSupabase,
  listFeaturedResortsFromSupabase,
  listPublishedResortsFromSupabase,
  type ResortQueryFilters,
  type ResortWithRelations
} from "@/lib/supabase/resorts";

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

export async function getCatalogResorts(filters: CatalogFilters): Promise<ResortWithRelations[]> {
  try {
    return await getCachedPublishedResorts(filters);
  } catch (error) {
    console.error("Failed to load catalog resorts", error);
    return [];
  }
}

export async function getFeaturedResorts(): Promise<ResortWithRelations[]> {
  try {
    return await getCachedFeaturedResorts();
  } catch (error) {
    console.error("Failed to load featured resorts", error);
    return [];
  }
}

export async function getResortBySlug(slug: string): Promise<ResortWithRelations | null> {
  try {
    return await getCachedResortBySlug(slug);
  } catch (error) {
    console.error(`Failed to load resort by slug: ${slug}`, error);
    return null;
  }
}
