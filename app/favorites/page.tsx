import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesPageClient } from "@/components/catalog/favorites-page-client";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Избранное", "Пользовательская страница сохранённых зон отдыха.");

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/catalog" className="text-sm text-black/55">
          Вернуться в каталог
        </Link>
        <div className="mb-8 mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">favorites</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink md:text-6xl">
              Сохраните то, что понравилось, и возвращайтесь без спешки.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-black/64">
            Избранное помогает не потерять хорошие варианты. Здесь удобно собирать объекты, которые визуально и по условиям подходят, а потом уже сравнивать их между собой.
          </p>
        </div>
        <FavoritesPageClient />
      </div>
    </main>
  );
}
