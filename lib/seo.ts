import type { Metadata } from "next";

export const siteName = "Alakol Select";
export const siteTagline = "Каталог зон отдыха на Алаколе";
export const siteDescription =
  "Alakol Select помогает выбрать зону отдыха на Алаколе по фото, цене, условиям, расстоянию до берега и карте.";
export const siteKeywords = [
  "Алаколь",
  "зоны отдыха Алаколь",
  "отдых на Алаколе",
  "базы отдыха Алаколь",
  "каталог зон отдыха",
  "Алаколь Акши",
  "Алаколь Кабанбай"
];

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  const normalized = raw.replace(/^\uFEFF/, "").trim();
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  return path === "/" ? base : `${base}${path}`;
}

export function noIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false
      }
    }
  };
}
