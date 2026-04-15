"use client";

import Link from "next/link";
import { CatalogFilters } from "@/lib/resorts";
import { Input } from "@/components/ui/input";

type CatalogFiltersProps = {
  filters: CatalogFilters;
};

const zones = ["Акши", "Кабанбай"];

const toggles = [
  { key: "familyFriendly", label: "Семейный формат" },
  { key: "youthFriendly", label: "Для компании" },
  { key: "hasPool", label: "Бассейн" },
  { key: "hasWifi", label: "Wi-Fi" },
  { key: "hasParking", label: "Парковка" },
  { key: "hasKidsZone", label: "Детская зона" }
] as const;

export function CatalogFiltersPanel({ filters }: CatalogFiltersProps) {
  return (
    <aside className="rounded-[2.2rem] bg-white p-6 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <div className="border-b border-black/8 pb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-black/40">Фильтры</p>
        <h2 className="mt-3 font-display text-4xl leading-none text-ink">Подобрать спокойно</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-black/58">
          Сузьте выбор по цене, локации и формату отдыха, а затем смотрите карточки уже в удобном порядке.
        </p>
      </div>
      <form action="/catalog" className="mt-5 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Поиск</p>
          <Input name="q" defaultValue={filters.q} placeholder="Название, зона, удобство" className="mt-2 border-black/10 bg-[#fcfaf5]" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-black/55">Мин. цена</label>
            <Input type="number" name="minPrice" defaultValue={filters.minPrice} placeholder="20000" className="border-black/10 bg-[#fcfaf5]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-black/55">Макс. цена</label>
            <Input type="number" name="maxPrice" defaultValue={filters.maxPrice} placeholder="60000" className="border-black/10 bg-[#fcfaf5]" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-black/55">Зона отдыха</p>
          <div className="flex flex-wrap gap-2">
            <label className={`rounded-full px-4 py-2 text-sm ${!filters.zone ? "bg-pine text-white" : "bg-mist text-ink"}`}>
              <input type="radio" name="zone" value="" defaultChecked={!filters.zone} className="hidden" />
              Все зоны
            </label>
            {zones.map((zone) => {
              const active = filters.zone === zone;
              return (
                <label key={zone} className={`rounded-full px-4 py-2 text-sm ${active ? "bg-pine text-white" : "bg-mist text-ink"}`}>
                  <input type="radio" name="zone" value={zone} defaultChecked={active} className="hidden" />
                  {zone}
                </label>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          {toggles.map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm">
              <input
                type="checkbox"
                name={toggle.key}
                value="true"
                defaultChecked={Boolean(filters[toggle.key])}
                className="size-4 rounded border-black/15"
              />
              {toggle.label}
            </label>
          ))}
        </div>
        <div className="rounded-[1.6rem] bg-[#f7f1e6] p-4 text-sm leading-6 text-black/58">
          Отмечайте только важные параметры. Остальное удобнее сравнивать уже на самой карточке объекта.
        </div>
        <div className="flex gap-3">
          <button className="flex-1 rounded-full bg-pine px-4 py-3 text-sm font-medium text-white">Применить</button>
          <Link href="/catalog" className="rounded-full bg-mist px-4 py-3 text-sm font-medium text-ink">
            Сбросить
          </Link>
        </div>
      </form>
    </aside>
  );
}
