import type { Metadata } from "next";
import Link from "next/link";
import { EventTracker } from "@/components/analytics/event-tracker";
import { CatalogFiltersPanel } from "@/components/catalog/catalog-filters";
import { LakeMap } from "@/components/catalog/lake-map";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { QuickPicks } from "@/components/catalog/quick-picks";
import { ResortCard } from "@/components/catalog/resort-card";
import { parseFilters, getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

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
    <main id="top" className="min-h-screen bg-[#f7f1e6] pb-28 md:pb-0">
      <EventTracker eventType="catalog_view" metadata={{ resultCount: resorts.length }} />
      <section className="bg-[linear-gradient(135deg,#132028_0%,#244b56_100%)] px-5 pb-14 pt-10 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="text-sm text-white/70">На главную</Link>
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">catalog</p>
              <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">Каталог зон отдыха на Алаколе</h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/75">
              Сравнивайте объекты по фото, цене, карте, расстоянию до берега и основным условиям. Можно сохранить понравившиеся варианты или добавить их в сравнение.
            </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">В каталоге</p>
              <p className="mt-2 font-display text-4xl">{resorts.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Диапазон цен</p>
              <p className="mt-2 font-display text-2xl">
                от {resorts.length ? new Intl.NumberFormat("ru-RU").format(Math.min(...resorts.map((r) => r.minPrice))) : "0"} ₸
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Что можно сделать</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Открыть карточку, сохранить объект, сравнить варианты и оставить заявку.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[360px_1fr] md:px-8">
        <div className="space-y-6">
          <div className="lg:hidden">
            <MobileFilters filters={filters} resultCount={resorts.length} />
          </div>
          <div className="hidden lg:block">
            <CatalogFiltersPanel filters={filters} />
          </div>
          <LakeMap resorts={resorts} />
        </div>
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-black/55">Найдено объектов: {resorts.length}</p>
            {params.lead === "success" && <p className="rounded-full bg-[#d6f0e4] px-4 py-2 text-sm text-pine">Заявка отправлена</p>}
          </div>
          {resorts.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {resorts.map((resort) => (
                <ResortCard key={resort.id} resort={resort} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <h2 className="font-display text-4xl text-ink">Ничего не найдено</h2>
              <p className="mt-4 text-sm leading-6 text-black/60">Попробуйте снять часть фильтров или вернуться ко всему каталогу.</p>
              <Link href="/catalog" className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                Сбросить фильтры
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8">
        <QuickPicks />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-[rgba(247,241,230,0.94)] p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-black/38">Каталог</p>
            <p className="truncate text-sm text-black/65">{resorts.length} вариантов для просмотра и сравнения</p>
          </div>
          <a href="#top" className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink">
            Наверх
          </a>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    </main>
  );
}
