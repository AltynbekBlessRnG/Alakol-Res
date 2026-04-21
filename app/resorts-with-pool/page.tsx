import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";
import { getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Зоны отдыха на Алаколе с бассейном",
  description:
    "Подборка зон отдыха на Алаколе с бассейном: фото, условия, цены, карта и быстрый способ связаться с объектом.",
  keywords: [...siteKeywords, "Алаколь с бассейном", "зоны отдыха с бассейном", "базы отдыха Алаколь бассейн"],
  alternates: {
    canonical: "/resorts-with-pool"
  },
  openGraph: {
    title: `${siteName} | Зоны отдыха на Алаколе с бассейном`,
    description: "Подберите зоны отдыха на Алаколе с бассейном по фото, условиям, цене и расположению.",
    url: "/resorts-with-pool"
  }
};

export default async function ResortsWithPoolPage() {
  const resorts = (await getCatalogResorts({ hasPool: true })).slice(0, 6);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Зоны отдыха на Алаколе с бассейном",
    url: absoluteUrl("/resorts-with-pool"),
    description: "Подборка объектов с бассейном для тех, кто ищет дополнительные удобства на Алаколе."
  };

  return (
    <>
      <SeoLandingPage
        eyebrow="удобство: бассейн"
        title="Зоны отдыха на Алаколе с бассейном: подборка для тех, кому важен дополнительный комфорт"
        description="Бассейн для многих гостей становится важным критерием: для детей, для спокойного отдыха утром и вечером или как дополнительное удобство рядом с озером."
        intro={[
          "Не все гости выбирают отдых только по береговой линии. Часто важен дополнительный комфорт на территории, и именно поэтому запросы по зонам отдыха на Алаколе с бассейном встречаются отдельно.",
          "На этой странице собраны объекты, где бассейн уже есть в наборе ключевых условий. Это удобно, если вы не хотите искать такие варианты вручную по всему каталогу.",
          "После этого можно открыть карточку каждого объекта, посмотреть цены, описание, карту, фото территории и быстро перейти к контакту."
        ]}
        stats={[
          { label: "Ключевой фильтр", value: "бассейн" },
          { label: "Подборка", value: `${resorts.length} объектов` },
          { label: "Подходит для", value: "семей и комфортного отдыха" }
        ]}
        resorts={resorts}
        links={[
          { href: "/family-friendly-alakol", label: "Семейный отдых", description: "Удобно, если бассейн важен именно в семейной поездке." },
          { href: "/akshi-resorts", label: "Акши", description: "Посмотреть отдельно объекты в популярной локации." },
          { href: "/first-line-alakol", label: "Первая линия", description: "Если приоритет всё же ближе к воде, а не внутри территории." },
          { href: "/catalog", label: "Весь каталог", description: "Открыть полный поиск по всем фильтрам." }
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
