import type { Metadata } from "next";
import Link from "next/link";
import { ComparePageClient } from "@/components/catalog/compare-page-client";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Сравнение объектов", "Пользовательская страница сравнения зон отдыха.");

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/catalog" className="text-sm text-black/55">
          Вернуться в каталог
        </Link>
        <div className="mt-6 mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">compare</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink md:text-6xl">
              Сравните зоны отдыха по-настоящему, а не по памяти.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-black/64">
            Эта страница помогает быстро увидеть разницу между объектами по цене, расстоянию до воды, формату отдыха, удобствам и ключевым условиям.
          </p>
        </div>
        <ComparePageClient />
      </div>
    </main>
  );
}
