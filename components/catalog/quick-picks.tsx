import Link from "next/link";

const picks = [
  {
    href: "/catalog?familyFriendly=true",
    title: "Для семьи",
    description: "Спокойный формат, детские условия и более понятный сценарий отдыха с детьми."
  },
  {
    href: "/catalog?hasPool=true",
    title: "С бассейном",
    description: "Если бассейн на территории так же важен, как и сам берег."
  },
  {
    href: "/catalog?maxPrice=30000",
    title: "До 30 000 ₸",
    description: "Быстрый вход в более доступный ценовой диапазон без ручной сборки фильтров."
  },
  {
    href: "/catalog?youthFriendly=true",
    title: "Для компании",
    description: "Более динамичные объекты для друзей, террас и живой атмосферы."
  },
  {
    href: "/catalog?zone=%D0%90%D0%BA%D1%88%D0%B8",
    title: "Только Акши",
    description: "Если вы уже знаете нужную часть Алаколя и хотите сузить выбор по локации."
  },
  {
    href: "/first-line-alakol",
    title: "Ближе к воде",
    description: "Подборка для тех, кто хочет сократить путь до берега и сразу видеть первую линию."
  },
  {
    href: "/catalog?zone=%D0%9A%D0%BE%D0%BA%D1%82%D1%83%D0%BC%D0%B0",
    title: "Только Коктума",
    description: "Если нужен более спокойный восточный сценарий отдыха и отдельная география."
  },
  {
    href: "/catalog?minPrice=40000",
    title: "Премиальнее",
    description: "Подборка для тех, кому важны более сильные фото, сервис и дорогой формат."
  }
] as const;

export function QuickPicks() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">готовые сценарии</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Начать с понятного сценария</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/58">
          Это быстрые входы для самых частых клиентских запросов. Один клик вместо длинной ручной настройки фильтров.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {picks.map((pick) => (
          <Link key={pick.href} href={pick.href} className="interactive-surface rounded-[1.5rem] bg-[#f7f1e6] p-5 transition hover:bg-[#efe5d3]">
            <p className="text-xs uppercase tracking-[0.18em] text-black/38">Быстрый выбор</p>
            <h3 className="mt-3 font-display text-2xl text-ink">{pick.title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/62">{pick.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
