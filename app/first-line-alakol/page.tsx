import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";
import { getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Зоны отдыха на Алаколе на первой линии",
  description:
    "Подборка зон отдыха на Алаколе рядом с водой: первая линия, минимальное расстояние до берега, фото, карта и цены.",
  keywords: [...siteKeywords, "первая линия Алаколь", "рядом с водой Алаколь", "зоны отдыха у берега"],
  alternates: {
    canonical: "/first-line-alakol"
  },
  openGraph: {
    title: `${siteName} | Зоны отдыха на Алаколе на первой линии`,
    description: "Подберите объекты на Алаколе, где особенно важна близость к воде и понятная береговая линия.",
    url: "/first-line-alakol"
  }
};

export default async function FirstLineAlakolPage() {
  const resorts = (await getCatalogResorts({})).filter((resort) => resort.distanceToLakeM <= 120).slice(0, 6);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Зоны отдыха на Алаколе на первой линии",
    url: absoluteUrl("/first-line-alakol"),
    description: "Подборка объектов у воды для гостей, которым особенно важна близость к берегу."
  };

  return (
    <>
      <SeoLandingPage
        eyebrow="близко к воде"
        title="Зоны отдыха на Алаколе на первой линии: где до берега действительно недалеко"
        description="Для многих поездок решающим фактором становится именно расстояние до воды. Эта страница помогает быстро посмотреть объекты, где близость к берегу особенно важна."
        intro={[
          "Запросы про первую линию на Алаколе обычно появляются у тех, кто хочет тратить меньше времени на дорогу до озера, быстрее выходить к пляжу и лучше чувствовать сам формат отдыха у воды.",
          "Здесь собраны зоны отдыха, где расстояние до берега минимально или очень комфортно для ежедневного сценария отдыха. Это особенно важно для семей, пар и гостей, которые ценят вид, доступность и атмосферу озера рядом.",
          "После этого можно перейти в карточку объекта, посмотреть фото, карту, условия, береговую линию и сразу связаться с владельцем."
        ]}
        stats={[
          { label: "Критерий", value: "близко к воде" },
          { label: "Подборка", value: `${resorts.length} объектов` },
          { label: "Важно для", value: "пляжного сценария" }
        ]}
        resorts={resorts}
        links={[
          { href: "/family-friendly-alakol", label: "Семейный отдых", description: "Если близость к воде нужна для поездки с детьми." },
          { href: "/akshi-resorts", label: "Акши", description: "Посмотреть подборку внутри одной популярной локации." },
          { href: "/resorts-with-pool", label: "С бассейном", description: "Сравнить другой сценарий комфорта внутри объекта." },
          { href: "/catalog", label: "Весь каталог", description: "Перейти к полному каталогу с фильтрами." }
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
