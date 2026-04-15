import Link from "next/link";

const picks = [
  {
    href: "/catalog?familyFriendly=true",
    title: "Для семьи",
    description: "Спокойный формат, удобства и сценарий для отдыха с детьми."
  },
  {
    href: "/catalog?hasPool=true",
    title: "С бассейном",
    description: "Если дополнительный комфорт на территории важен не меньше берега."
  },
  {
    href: "/catalog?maxPrice=30000",
    title: "До 30 000 ₸",
    description: "Быстрый вход в более доступный ценовой диапазон."
  },
  {
    href: "/catalog?youthFriendly=true",
    title: "Для компании",
    description: "Более динамичные объекты для друзей, террас и вечерних сценариев."
  },
  {
    href: "/catalog?zone=%D0%90%D0%BA%D1%88%D0%B8",
    title: "Только Акши",
    description: "Если вы уже понимаете, в какой части Алаколя хотите отдыхать."
  },
  {
    href: "/first-line-alakol",
    title: "Ближе к воде",
    description: "Подборка и быстрый путь к объектам с комфортным расстоянием до берега."
  }
] as const;

export function QuickPicks() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">готовые сценарии</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Выбрать без ручной настройки</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/58">
          Это быстрые входы в каталог для самых частых клиентских запросов. Один клик вместо длинной сборки фильтров.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {picks.map((pick) => (
          <Link key={pick.href} href={pick.href} className="rounded-[1.5rem] bg-[#f7f1e6] p-5 transition hover:bg-[#efe5d3]">
            <h3 className="font-display text-2xl text-ink">{pick.title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/62">{pick.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
