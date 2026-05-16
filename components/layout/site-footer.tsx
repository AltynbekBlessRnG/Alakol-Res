import Link from "next/link";
import { Heart, MapPin, Scale, UserRound } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";

const primaryLinks = [
  { href: "/catalog", label: "Каталог", icon: MapPin },
  { href: "/favorites", label: "Избранное", icon: Heart },
  { href: "/compare", label: "Сравнение", icon: Scale },
  { href: "/login", label: "Кабинет", icon: UserRound }
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0d1f1a] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="size-11 bg-white" />
              <span>
                <span className="block text-xl font-semibold tracking-[0.18em]">ALAKOL SELECT</span>
                <span className="mt-1 block text-sm text-white/58">Каталог зон отдыха</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
              Выбирайте место по фото, цене, карте и условиям. Без лишних страниц и случайных контактов.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[430px]">
            {primaryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78 transition hover:border-white/22 hover:bg-white/10 hover:text-white"
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon size={17} className="text-[#d49b35]" />
                    {item.label}
                  </span>
                  <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white">→</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Alakol Select</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/catalog#catalog-map" className="transition hover:text-white">Карта объектов</Link>
            <Link href="/login" className="transition hover:text-white">Для владельцев</Link>
            <Link href="/catalog" className="transition hover:text-white">Все зоны отдыха</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
