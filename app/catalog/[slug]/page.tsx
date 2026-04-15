import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, PhoneCall, ShieldCheck, Sparkles, Star, Waves } from "lucide-react";
import { EventTracker } from "@/components/analytics/event-tracker";
import { PublicActions } from "@/components/catalog/public-actions";
import { ResortGallery } from "@/components/catalog/resort-gallery";
import { LeadForm } from "@/components/forms/lead-form";
import { ReviewForm } from "@/components/forms/review-form";
import { ResortLocationMap } from "@/components/map/resort-location-map";
import { getResortBySlug } from "@/lib/resorts";
import { absoluteUrl, siteName } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

type ResortDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ResortDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resort = await getResortBySlug(slug);
  if (!resort) return { title: "Объект не найден" };
  const cover = resort.images[0]?.url;
  return {
    title: resort.title,
    description: resort.shortDescription,
    alternates: {
      canonical: `/catalog/${resort.slug}`
    },
    openGraph: {
      title: resort.title,
      description: resort.shortDescription,
      url: `/catalog/${resort.slug}`,
      images: cover ? [{ url: cover }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${resort.title} | ${siteName}`,
      description: resort.shortDescription,
      images: cover ? [cover] : []
    }
  };
}

export default async function ResortDetailPage({ params }: ResortDetailPageProps) {
  const { slug } = await params;
  const resort = await getResortBySlug(slug);

  if (!resort) notFound();
  const summaryCards = [
    { label: "Формат", value: resort.accommodationType },
    { label: "Берег", value: resort.beachLine },
    { label: "Отзывы", value: resort.approvedReviewsCount ? `${resort.ratingAverage} / 5` : "Новая карточка" },
    { label: "Трансфер", value: resort.transferInfo }
  ].filter((item) => item.value?.trim());
  const detailFacts = [
    { label: "Что включено", value: resort.includedText },
    { label: "Берег", value: resort.beachLine },
    { label: "Трансфер", value: resort.transferInfo },
    { label: "Правила", value: resort.rulesText }
  ].filter((item) => item.value?.trim());
  const spotlightCards = [
    {
      icon: ShieldCheck,
      title: "Проверено",
      text: "Карточка прошла модерацию и собрана без лишнего шума."
    },
    ...(resort.includedText.trim()
      ? [
          {
            icon: Waves,
            title: "Что включено",
            text: resort.includedText
          }
        ]
      : []),
    {
      icon: Sparkles,
      title: "Лучше всего подходит",
      text: `${resort.familyFriendly ? "Семейный формат" : "Пара и спокойный отдых"}${resort.youthFriendly ? ", компания друзей" : ""}`
    },
    {
      icon: Star,
      title: "Рейтинг",
      text: resort.approvedReviewsCount ? `${resort.ratingAverage} / 5 по ${resort.approvedReviewsCount} отзывам` : "Новый объект, рейтинг формируется"
    }
  ];
  const detailSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: resort.title,
    description: resort.shortDescription,
    url: absoluteUrl(`/catalog/${resort.slug}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: resort.address,
      addressLocality: resort.zone,
      addressCountry: "KZ"
    },
    telephone: resort.contactPhone,
    image: resort.images.map((image) => image.url),
    amenityFeature: resort.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.label,
      value: true
    })),
    aggregateRating: resort.approvedReviewsCount
      ? { "@type": "AggregateRating", ratingValue: resort.ratingAverage, reviewCount: resort.approvedReviewsCount }
      : undefined
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог",
        item: absoluteUrl("/catalog")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resort.title,
        item: absoluteUrl(`/catalog/${resort.slug}`)
      }
    ]
  };

  return (
    <main className="bg-[#f7f1e6] pb-28 md:pb-24">
      <EventTracker eventType="resort_view" resortId={resort.id} slug={resort.slug} metadata={{ title: resort.title }} />

      <section className="relative min-h-[62svh] overflow-hidden bg-[#132028] text-white md:min-h-[72vh]">
        {resort.images[0] && (
          <Image src={resort.images[0].url} alt={resort.images[0].alt} fill priority className="object-cover opacity-55" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,29,37,0.18),rgba(15,29,37,0.84)),radial-gradient(circle_at_top_left,rgba(212,155,53,0.18),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[62svh] max-w-7xl flex-col justify-between px-5 pb-12 pt-8 md:min-h-[72vh] md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/catalog" className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              Назад в каталог
            </Link>
            <div className="hidden md:block">
              <PublicActions slug={resort.slug} title={resort.title} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">{resort.zone}</p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] md:text-7xl">{resort.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">{resort.shortDescription}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">от {formatPrice(resort.minPrice)} ₸ / сутки</span>
                <span className="rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">{resort.distanceToLakeM} м до воды</span>
                <span className="rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">{resort.foodOptions}</span>
                {resort.approvedReviewsCount > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <Star size={16} className="fill-[#d49b35] text-[#d49b35]" />
                    {resort.ratingAverage} · {resort.approvedReviewsCount} отзывов
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 rounded-[2rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md md:grid-cols-2 md:p-5">
              {summaryCards.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">{item.label}</p>
                  <p className="mt-3 text-lg text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 md:hidden">
            <PublicActions slug={resort.slug} title={resort.title} />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-2 pt-6 max-w-7xl px-5 md:pt-8 md:px-8">
        <div className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-[0_20px_80px_rgba(19,32,40,0.10)] md:grid-cols-2 xl:grid-cols-4">
          {spotlightCards.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] bg-[#f7f1e6] p-4">
              <div className="flex items-center gap-2 text-sm text-pine">
                <item.icon size={16} className={item.title === "Рейтинг" ? "fill-[#d49b35] text-[#d49b35]" : undefined} />
                {item.title}
              </div>
              <p className="mt-3 text-sm leading-6 text-black/65">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <div className="flex items-center gap-2 text-sm text-pine">
                <BadgeCheck size={16} />
                Проверенная карточка
              </div>
              <h2 className="mt-5 font-display text-4xl text-ink">О зоне отдыха</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/72">{resort.description}</p>
            </div>

            <ResortGallery images={resort.images.slice(1)} />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
                <h2 className="font-display text-3xl text-ink">Условия и удобства</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {resort.amenities.map((amenity) => (
                    <span key={amenity.id} className="rounded-full bg-[#f7f1e6] px-4 py-3 text-sm">
                      {amenity.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
                <h2 className="font-display text-3xl text-ink">Проверенная информация</h2>
                {detailFacts.length ? (
                  <div className="mt-5 space-y-4 text-sm leading-7 text-black/68">
                    {detailFacts.map((item) => (
                      <p key={item.label}>
                        <strong>{item.label}:</strong> {item.value}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-black/58">
                    Подробные условия лучше уточнить при обращении: владелец подскажет по правилам, берегу и тому, что входит в стоимость.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <h2 className="font-display text-3xl text-ink">Цены и размещение</h2>
              <div className="mt-6 grid gap-4">
                {resort.prices.map((price) => (
                  <div key={price.id} className="flex flex-col gap-2 rounded-[1.5rem] bg-[#f7f1e6] px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-medium text-ink">{price.label}</p>
                      <p className="text-sm text-black/55">{price.description}</p>
                    </div>
                    <p className="text-lg font-medium text-pine">{formatPrice(price.amount)} ₸</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="reviews" className="rounded-[2rem] bg-white p-8 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-3xl text-ink">Отзывы гостей</h2>
                {resort.approvedReviewsCount > 0 && <p className="text-sm text-black/55">{resort.ratingAverage} / 5</p>}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {resort.reviews.length ? resort.reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.5rem] bg-[#f7f1e6] p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-ink">{review.authorName}</p>
                      <p className="text-sm text-black/50">{review.rating}/5</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/65">{review.body}</p>
                  </div>
                )) : <p className="text-sm text-black/55">Пока нет опубликованных отзывов.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Быстрый контакт</p>
              <p className="mt-3 font-display text-4xl text-ink">от {formatPrice(resort.minPrice)} ₸</p>
              <p className="mt-2 text-sm text-black/58">за базовый вариант размещения</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`tel:${resort.contactPhone}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-pine px-4 py-3 text-sm font-medium text-white">
                  <PhoneCall size={16} />
                  Позвонить
                </a>
                <a href={`https://wa.me/${resort.whatsapp}`} target="_blank" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#dff4e7] px-4 py-3 text-sm font-medium text-pine">
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>

            <LeadForm resortId={resort.id} id="lead-form" />
            <ReviewForm resortId={resort.id} returnTo={`/catalog/${resort.slug}`} />
          </div>
        </div>
      </section>

      <section className="overflow-x-clip pt-6">
        <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,#d7e7ea_0%,#eef4f3_100%)] py-10 md:py-12">
          <div className="mx-auto w-full max-w-[1540px] px-5 md:px-8">
            <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
              <div className="max-w-4xl">
                <p className="text-xs uppercase tracking-[0.22em] text-black/42">Карта и расположение</p>
                <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-ink md:text-5xl xl:text-6xl">
                  Где находится {resort.title}
                </h2>
              </div>
              <div className="max-w-xl text-sm leading-7 text-black/62 lg:justify-self-end">
                До воды {resort.distanceToLakeM} м, адрес: {resort.address}. Здесь удобно заранее оценить локацию, берег и подъезд к объекту.
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.2rem] border border-white/60 bg-white shadow-[0_28px_80px_rgba(17,36,42,0.12)]">
              <ResortLocationMap
                title={resort.title}
                address={resort.address}
                latitude={resort.latitude}
                longitude={resort.longitude}
              />
            </div>

            <div className="mt-5 grid gap-4 rounded-[2rem] bg-white/78 p-5 shadow-[0_12px_40px_rgba(17,36,42,0.08)] backdrop-blur-sm md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="flex items-center gap-2 text-base text-ink">
                  <MapPin size={18} />
                  {resort.address}
                </p>
                <p className="mt-2 text-sm text-black/60">Координаты: {resort.latitude}, {resort.longitude}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${resort.contactPhone}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                  <PhoneCall size={16} />
                  Позвонить
                </a>
                <a href={`https://wa.me/${resort.whatsapp}`} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-pine">
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/38">Быстрый контакт</p>
              <p className="text-sm text-black/65">от {formatPrice(resort.minPrice)} ₸ · {resort.distanceToLakeM} м до воды</p>
            </div>
            <a href="#lead-form" className="text-sm font-medium text-pine">Заявка</a>
          </div>
          <div className="flex gap-3">
            <a href={`tel:${resort.contactPhone}`} className="flex-1 rounded-full bg-pine px-4 py-3 text-center text-sm font-medium text-white">Позвонить</a>
            <a href={`https://wa.me/${resort.whatsapp}`} target="_blank" className="flex-1 rounded-full bg-[#d6f0e4] px-4 py-3 text-center text-sm font-medium text-pine">WhatsApp</a>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(detailSchema)
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </main>
  );
}
