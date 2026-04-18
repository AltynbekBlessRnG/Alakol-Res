import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned, Sparkles, Star, Waves } from "lucide-react";
import { getCatalogResorts, getFeaturedResorts } from "@/lib/resorts";
import { absoluteUrl, siteDescription, siteKeywords, siteName } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Каталог зон отдыха на Алаколе с фото, ценами, картой и прямой связью с объектами.",
  keywords: [...siteKeywords, "главная", "выбор зоны отдыха"],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${siteName} | Зоны отдыха на Алаколе`,
    description:
      "Смотрите зоны отдыха на Алаколе по фото, цене, расположению и условиям. Выбирайте и сразу связывайтесь с объектом.",
    url: "/"
  }
};

export default async function HomePage() {
  const resorts = await getCatalogResorts({});
  const featuredResorts = await getFeaturedResorts();
  const featured = featuredResorts.length ? featuredResorts : resorts;
  const popularResorts = (featured.length >= 6 ? featured : resorts).slice(0, 6);
  const minPrice = resorts.length ? Math.min(...resorts.map((resort) => resort.minPrice)) : 0;
  const familyCount = resorts.filter((resort) => resort.familyFriendly).length;
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/catalog")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    description: siteDescription
  };

  return (
    <main className="bg-[#f6f0e4] text-ink">
      <section className="relative min-h-[calc(100svh-0.75rem)] overflow-hidden bg-[#102028] text-white">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Берег Алаколя на закате"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,20,27,0.2),rgba(9,20,27,0.84)),radial-gradient(circle_at_top_left,rgba(77,176,203,0.3),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-0.75rem)] max-w-7xl items-center px-5 pb-8 pt-24 md:px-8 md:pb-10 md:pt-28">
          <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-white/68">alakol select</p>
              <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[0.94] md:text-6xl xl:text-7xl">
                Зоны отдыха на Алаколе в одном удобном каталоге.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/74 md:text-lg md:leading-8">
                Смотрите фото, цены, карту, условия и расстояние до берега. Сравнивайте варианты и быстро выходите на заявку или WhatsApp.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/catalog" className="interactive-surface rounded-full bg-white px-6 py-3 text-sm font-medium text-ink shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
                  Смотреть каталог
                </Link>
                <Link href="/compare" className="interactive-surface rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white">
                  Сравнить объекты
                </Link>
              </div>
              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">Объектов</p>
                  <p className="mt-2 font-display text-3xl">{resorts.length}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Актуальные карточки с фото и условиями.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">По цене</p>
                  <p className="mt-2 font-display text-2xl">от {formatPrice(minPrice)} ₸</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Быстрый вход в понятный бюджет.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">Семейных</p>
                  <p className="mt-2 font-display text-3xl">{familyCount}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">Подходят для детей и спокойного отдыха.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-[rgba(255,250,243,0.92)] p-5 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-black/38">быстрый поиск</p>
              <h2 className="mt-3 font-display text-3xl leading-none text-ink md:text-4xl">Найти подходящий вариант</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-black/60">
                Укажите бюджет или название объекта и перейдите к подборке с фильтрами, картой и карточками.
              </p>
              <form action="/catalog" className="mt-5 space-y-3">
                <input
                  name="q"
                  placeholder="Например, Акши, семейный или бассейн"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-pine"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="minPrice"
                    type="number"
                    placeholder="Мин. цена"
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-pine"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    placeholder="Макс. цена"
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-pine"
                  />
                </div>
                <button className="interactive-surface inline-flex items-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white shadow-[0_16px_35px_rgba(28,70,58,0.22)]">
                  Перейти в каталог
                  <ArrowRight size={16} />
                </button>
              </form>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-black/55">
                {["Фото и цены", "Карта и локация", "Сравнение", "WhatsApp и заявка"].map((item) => (
                  <span key={item} className="rounded-full bg-black/5 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">рекомендуем посмотреть</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-ink">
              Популярные варианты, с которых удобно начать поиск
            </h2>
          </div>
          <Link href="/catalog" className="text-sm text-pine">
            Смотреть весь каталог
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {popularResorts.map((resort) => (
            <Link
              key={resort.id}
              href={`/catalog/${resort.slug}`}
              className="group interactive-surface relative overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_70px_rgba(14,26,31,0.08)] hover:shadow-[0_30px_100px_rgba(14,26,31,0.15)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,155,53,0.12),transparent_38%)] opacity-0 transition duration-500 group-hover:opacity-100" />
              {resort.images[0] && (
                <div className="relative h-72">
                  <Image
                    src={resort.images[0].url}
                    alt={resort.images[0].alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110 group-hover:-rotate-[0.6deg]"
                  />
                  {resort.approvedReviewsCount > 0 && (
                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/62 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition duration-300 group-hover:-translate-y-1 group-hover:bg-black/72">
                      <Star size={15} className="fill-[#f2c45b] text-[#f2c45b]" />
                      <span>{resort.ratingAverage}/5</span>
                    </div>
                  )}
                </div>
              )}
              <div className="relative p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-black/45 transition duration-300 group-hover:text-black/65">{resort.zone}</p>
                <h3 className="mt-2 font-display text-3xl transition duration-300 group-hover:translate-x-1">{resort.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/65 transition duration-300 group-hover:text-black/78">{resort.shortDescription}</p>
                <div className="mt-5 flex items-center justify-between gap-4 transition duration-300 group-hover:translate-y-1">
                  <p className="text-sm font-medium text-pine">от {formatPrice(resort.minPrice)} ₸ / сутки</p>
                  {resort.approvedReviewsCount > 0 && (
                    <p className="text-sm text-black/48">{resort.approvedReviewsCount} отзывов</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem]">
            <Image
              src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80"
              alt="Пирс и спокойное озеро"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,24,29,0.05),rgba(15,24,29,0.65))]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/62">для удобного подбора</p>
              <h2 className="mt-3 max-w-md font-display text-5xl leading-none">Всё важное по объекту собрано в одном месте.</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: Waves,
                title: "Понятные условия",
                text: "В карточке сразу видно цену, берег, формат отдыха, питание и ключевые удобства."
              },
              {
                icon: Sparkles,
                title: "Удобный выбор",
                text: "Можно сохранить понравившиеся варианты, сравнить объекты между собой и вернуться к ним позже."
              },
              {
                icon: MapPinned,
                title: "Карта и контакты",
                text: "У каждого объекта есть расположение на карте, телефон, WhatsApp и форма заявки."
              }
            ].map((item) => (
              <div key={item.title} className="border-b border-black/8 pb-5 last:border-b-0 last:pb-0">
                <item.icon className="text-pine" />
                <h3 className="mt-3 font-display text-3xl text-ink">{item.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-7 text-black/62">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">о каталоге</p>
            <h2 className="mt-4 max-w-xl font-display text-5xl leading-[0.98] text-ink">
              Alakol Select помогает быстро подобрать зону отдыха на Алаколе по реальным параметрам.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-black/66">
            <p>
              На сайте можно смотреть зоны отдыха на Алаколе по фото, цене, расстоянию до берега, типу размещения и удобствам. Это удобно для семей, пар и компаний, которые хотят быстро понять, подходит ли им объект.
            </p>
            <p>
              В каждой карточке собраны основные параметры: что включено, какой берег, есть ли парковка, Wi-Fi, бассейн, детская зона, как выглядит территория и как быстро связаться с владельцем.
            </p>
            <p>
              Каталог охватывает популярные направления Алаколя, включая Акши и Кабанбай, и помогает перейти к заявке без долгого поиска по мессенджерам и объявлениям.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="rounded-[2.2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">готовые подборки</p>
              <h2 className="mt-3 font-display text-4xl text-ink">Быстрые страницы под популярные запросы</h2>
            </div>
            <Link href="/catalog" className="text-sm text-pine">
              Открыть весь каталог
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {[
              {
                href: "/family-friendly-alakol",
                title: "Семейный отдых",
                text: "Подборка для тех, кто ищет спокойный формат отдыха и условия для детей."
              },
              {
                href: "/akshi-resorts",
                title: "Зоны отдыха в Акши",
                text: "Если вы хотите смотреть объекты отдельно по этой локации."
              },
              {
                href: "/resorts-with-pool",
                title: "С бассейном",
                text: "Для гостей, которым важен бассейн как часть отдыха."
              },
              {
                href: "/first-line-alakol",
                title: "Первая линия",
                text: "Подборка объектов для тех, кто хочет быть ближе к воде."
              }
            ].map((item) => (
              <Link key={item.href} href={item.href} className="interactive-surface rounded-[1.6rem] bg-[#f7f1e6] p-5 hover:bg-[#efe5d3]">
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/62">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    </main>
  );
}
