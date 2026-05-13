import Link from "next/link";

const picks = [
  { href: "/catalog?familyFriendly=true", title: "Для семьи", short: "детям удобно" },
  { href: "/catalog?hasPool=true", title: "С бассейном", short: "вода рядом" },
  { href: "/catalog?maxPrice=30000", title: "До 30 000 ₸", short: "доступнее" },
  { href: "/catalog?youthFriendly=true", title: "Для компании", short: "живее формат" },
  { href: "/catalog?zone=%D0%90%D0%BA%D1%88%D0%B8", title: "Акши", short: "популярная зона" },
  { href: "/first-line-alakol", title: "Ближе к воде", short: "первая линия" },
  { href: "/catalog?zone=%D0%9A%D0%BE%D0%BA%D1%82%D1%83%D0%BC%D0%B0", title: "Коктума", short: "спокойнее" },
  { href: "/catalog?minPrice=40000", title: "Премиум", short: "сильнее сервис" }
] as const;

export function QuickPicks() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-[1.35rem] border border-black/8 bg-white p-3 shadow-[0_12px_36px_rgba(14,26,31,0.08)] md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">быстрый выбор</p>
          <h2 className="mt-1 text-xl font-semibold text-ink md:text-2xl">Начать со сценария</h2>
        </div>
        <Link href="/catalog" className="hidden rounded-full bg-mist px-4 py-2 text-sm font-medium text-ink md:inline-flex">
          Все
        </Link>
      </div>
      <div className="-mx-1 w-full min-w-0 max-w-full overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 md:grid md:grid-cols-4">
          {picks.map((pick) => (
            <Link
              key={pick.href}
              href={pick.href}
              className="interactive-surface min-w-[146px] rounded-[1.1rem] bg-mist px-4 py-3 transition hover:bg-[#efe5d3] md:min-w-0"
            >
              <h3 className="text-sm font-semibold text-ink">{pick.title}</h3>
              <p className="mt-1 text-xs text-black/54">{pick.short}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
