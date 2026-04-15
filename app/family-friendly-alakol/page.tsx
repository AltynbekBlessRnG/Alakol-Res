import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";
import { getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Семейный отдых на Алаколе",
  description:
    "Подборка зон отдыха на Алаколе для семей с детьми: удобства, спокойный формат, парковка, питание, карта и цены.",
  keywords: [...siteKeywords, "семейный отдых на Алаколе", "Алаколь с детьми", "семейные зоны отдыха"],
  alternates: {
    canonical: "/family-friendly-alakol"
  },
  openGraph: {
    title: `${siteName} | Семейный отдых на Алаколе`,
    description:
      "Сравните семейные зоны отдыха на Алаколе по фото, условиям для детей, расстоянию до воды и ценам.",
    url: "/family-friendly-alakol"
  }
};

export default async function FamilyFriendlyAlakolPage() {
  const resorts = (await getCatalogResorts({ familyFriendly: true })).slice(0, 6);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Семейный отдых на Алаколе",
    url: absoluteUrl("/family-friendly-alakol"),
    description:
      "Подборка семейных зон отдыха на Алаколе с комфортным форматом размещения, удобствами для детей и спокойной атмосферой."
  };

  return (
    <>
      <SeoLandingPage
        eyebrow="семейный сценарий"
        title="Семейный отдых на Алаколе: зоны отдыха, где удобно с детьми и спокойно взрослым"
        description="Эта страница собрана для тех, кто ищет семейный формат отдыха у озера: важны тишина, удобства, детская инфраструктура, понятные цены и быстрый контакт с владельцем."
        intro={[
          "Семейный отдых на Алаколе чаще всего выбирают по нескольким понятным критериям: насколько близко вода, есть ли удобные номера или домики, насколько спокойно вечером и есть ли условия для детей.",
          "На этой подборке собраны зоны отдыха, которые подходят под более мягкий и спокойный формат поездки. Это удобно тем, кто хочет не просто увидеть общий каталог, а сразу перейти к подходящим вариантам.",
          "Дальше можно открыть карточку любого объекта, посмотреть фото, цены, питание, карту, береговую линию и сразу оставить заявку или перейти в WhatsApp."
        ]}
        stats={[
          { label: "Подборка", value: `${resorts.length} объектов` },
          { label: "Подходит для", value: "семей и детей" },
          { label: "Следующий шаг", value: "сравнить и оставить заявку" }
        ]}
        resorts={resorts}
        links={[
          { href: "/akshi-resorts", label: "Акши", description: "Подборка объектов по одному из самых популярных направлений Алаколя." },
          { href: "/resorts-with-pool", label: "С бассейном", description: "Если для семьи важен бассейн как дополнительный сценарий отдыха." },
          { href: "/first-line-alakol", label: "Первая линия", description: "Подборка для тех, кто хочет быть максимально близко к воде." },
          { href: "/catalog", label: "Весь каталог", description: "Открыть все зоны отдыха и настроить фильтры вручную." }
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
