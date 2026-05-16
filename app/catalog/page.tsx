import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { EventTracker } from "@/components/analytics/event-tracker";
import { CatalogFiltersPanel } from "@/components/catalog/catalog-filters";
import { LakeMap } from "@/components/catalog/lake-map";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { QuickPicks } from "@/components/catalog/quick-picks";
import { ResortCard } from "@/components/catalog/resort-card";
import { parseFilters, getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

export const revalidate = 300;

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const values = Object.values(params).flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));
  const hasFilters = values.length > 0;

  return {
    title: "Каталог зон отдыха",
    description:
      "Каталог зон отдыха на Алаколе с фильтрами по цене, удобствам, семейному формату, локации и расстоянию до берега.",
    keywords: [...siteKeywords, "каталог", "фильтры", "цены", "семейный отдых"],
    alternates: {
      canonical: "/catalog"
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true
          }
        }
      : {
          index: true,
          follow: true
        },
    openGraph: {
      title: `${siteName} | Каталог зон отдыха на Алаколе`,
      description:
        "Сравнивайте зоны отдыха на Алаколе по фото, цене, удобствам и расположению на карте в одном каталоге.",
      url: "/catalog"
    }
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const resorts = await getCatalogResorts(filters);
  const minPrice = resorts.length ? Math.min(...resorts.map((resort) => resort.minPrice)) : 0;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Каталог зон отдыха на Алаколе",
    url: absoluteUrl("/catalog"),
    description:
      "Подбор зон отдыха на Алаколе с фильтрами по цене, формату размещения, удобствам и расстоянию до воды.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resorts.slice(0, 12).map((resort, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/catalog/${resort.slug}`),
        name: resort.title
      }))
    }
  };

  return (
    <main id="top" className="min-h-screen bg-[#f7f1e6] pb-28 pt-16 md:pb-10 md:pt-20">
      <EventTracker eventType="catalog_view" metadata={{ resultCount: resorts.length }} />

      <section className="border-b border-black/8 bg-[#fbf7ef] px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Link href="/" className="text-sm text-black/52">Главная</Link>
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-black/40">catalog</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-ink md:text-5xl">
              Каталог зон отдыха
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62 md:text-base md:leading-7">
              Фото, цены, карта и контакты.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[1.35rem] border border-black/8 bg-white p-2 shadow-[0_12px_36px_rgba(19,32,40,0.08)] md:min-w-[430px]">
            <div className="rounded-2xl bg-mist px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-black/42">Найдено</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{resorts.length}</p>
            </div>
            <div className="rounded-2xl bg-mist px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-black/42">Цена от</p>
              <p className="mt-1 truncate text-lg font-semibold text-ink">{new Intl.NumberFormat("ru-RU").format(minPrice)} ₸</p>
            </div>
            <div className="rounded-2xl bg-mist px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-black/42">Действия</p>
              <p className="mt-1 text-sm font-medium leading-5 text-ink">Сравнение</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] min-w-0 gap-5 px-4 py-5 md:px-8 md:py-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
        <div className="min-w-0 lg:col-span-2">
          <QuickPicks />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="lg:hidden">
            <MobileFilters filters={filters} resultCount={resorts.length} />
          </div>

          <div className="hidden lg:block">
            <CatalogFiltersPanel filters={filters} />
          </div>

        </aside>

        <section className="min-w-0 max-w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-black/55">
              <Search size={16} />
              <span>Найдено объектов: {resorts.length}</span>
            </div>
            {params.lead === "success" && <p className="rounded-full bg-[#d6f0e4] px-4 py-2 text-sm text-pine">Заявка отправлена</p>}
          </div>

          {resorts.length ? (
            <div className="grid gap-4 md:gap-5 xl:grid-cols-2">
              {resorts.map((resort) => (
                <ResortCard key={resort.id} resort={resort} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.35rem] bg-white p-6 text-center shadow-[0_16px_48px_rgba(14,26,31,0.08)] md:p-10">
              <h2 className="text-2xl font-semibold text-ink md:text-4xl">Ничего не найдено</h2>
              <p className="mt-3 text-sm leading-6 text-black/60">Снимите часть фильтров.</p>
              <Link href="/catalog" className="mt-5 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                Сбросить фильтры
              </Link>
            </div>
          )}

        </section>

        <div id="catalog-map" className="min-w-0 lg:col-span-2">
          <LakeMap resorts={resorts} apiKey={googleMapsApiKey} />
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    </main>
  );
}
