import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { CompareBar } from "@/components/catalog/compare-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMetadataBase, siteDescription, siteKeywords, siteName } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${siteName} | Каталог зон отдыха на Алаколе`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName,
    title: `${siteName} | Каталог зон отдыха на Алаколе`,
    description: siteDescription,
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Каталог зон отдыха на Алаколе`,
    description: siteDescription
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CompareBar />
        </Providers>
      </body>
    </html>
  );
}
