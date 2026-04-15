import type { MetadataRoute } from "next";
import { listAllPublishedSlugs } from "@/lib/demo-data";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticPages = ["", "/catalog", "/family-friendly-alakol", "/akshi-resorts", "/resorts-with-pool", "/first-line-alakol"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
  const resorts = listAllPublishedSlugs().map((item) => ({
    url: `${base}/catalog/${item.slug}`,
    lastModified: new Date()
  }));
  return [...staticPages, ...resorts];
}
