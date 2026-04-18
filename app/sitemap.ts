import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { listAllPublishedSlugsFromSupabase } from "@/lib/supabase/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPages = ["", "/catalog", "/family-friendly-alakol", "/akshi-resorts", "/resorts-with-pool", "/first-line-alakol"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
  const resorts = (await listAllPublishedSlugsFromSupabase()).map((item) => ({
    url: `${base}/catalog/${item.slug}`,
    lastModified: new Date()
  }));
  return [...staticPages, ...resorts];
}
