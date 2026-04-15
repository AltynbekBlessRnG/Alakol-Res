import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo/seo-landing-page";
import { getCatalogResorts } from "@/lib/resorts";
import { absoluteUrl, siteKeywords, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Зоны отдыха в Акши",
  description:
    "Смотрите зоны отдыха в Акши на Алаколе: фото, цены, карта, питание, расстояние до воды и формат размещения.",
  keywords: [...siteKeywords, "зоны отдыха Акши", "Акши Алаколь", "отдых в Акши"],
  alternates: {
    canonical: "/akshi-resorts"
  },
  openGraph: {
    title: `${siteName} | Зоны отдыха в Акши`,
    description: "Подборка зон отдыха в Акши с фото, ценами, удобствами и быстрым выходом на заявку.",
    url: "/akshi-resorts"
  }
};

export default async function AkshiResortsPage() {
  const resorts = (await getCatalogResorts({ zone: "Акши" })).slice(0, 6);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Зоны отдыха в Акши на Алаколе",
    url: absoluteUrl("/akshi-resorts"),
    description: "Подборка зон отдыха в Акши с возможностью сравнить условия, цены, фото и расположение."
  };

  return (
    <>
      <SeoLandingPage
        eyebrow="локация: акши"
        title="Зоны отдыха в Акши на Алаколе: где остановиться, если важны удобство, берег и понятный выбор"
        description="Акши часто ищут отдельно, потому что людям важно сравнивать объекты именно внутри одной локации. Здесь собраны зоны отдыха в Акши, чтобы не фильтровать каталог вручную."
        intro={[
          "Когда человек ищет отдых в Акши на Алаколе, его обычно интересуют не просто названия объектов, а реальная разница между ними: насколько близко берег, какие фото территории, какой формат размещения и какой уровень цен.",
          "На этой странице собраны подходящие зоны отдыха в Акши, чтобы можно было быстро пройтись по карточкам и выбрать вариант под семью, пару или поездку с друзьями.",
          "После выбора всегда можно перейти на страницу объекта, посмотреть проверенную информацию, карту и сразу связаться с владельцем через звонок, WhatsApp или заявку."
        ]}
        stats={[
          { label: "Локация", value: "Акши" },
          { label: "В подборке", value: `${resorts.length} объектов` },
          { label: "Удобно для", value: "быстрого локального сравнения" }
        ]}
        resorts={resorts}
        links={[
          { href: "/family-friendly-alakol", label: "Семейный отдых", description: "Если выбор строится вокруг спокойного семейного формата." },
          { href: "/resorts-with-pool", label: "С бассейном", description: "Подборка для гостей, которым важен бассейн как удобство." },
          { href: "/first-line-alakol", label: "Первая линия", description: "Для тех, кто хочет поселиться ближе к воде." },
          { href: "/catalog", label: "Весь каталог", description: "Вернуться к общему поиску по всем зонам Алаколя." }
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
