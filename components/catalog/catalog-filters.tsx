"use client";

import Link from "next/link";
import { Check, Search } from "lucide-react";
import { CatalogFilters } from "@/lib/resorts";
import { Input } from "@/components/ui/input";

type CatalogFiltersProps = {
  filters: CatalogFilters;
};

const zones = ["Акши", "Кабанбай", "Коктума"];

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
    <aside className="rounded-[1.35rem] border border-black/8 bg-white p-4 shadow-[0_14px_42px_rgba(14,26,31,0.08)] md:p-5">
      <div className="border-b border-black/8 pb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-black/40">Фильтры</p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">Подобрать без перегруза</h2>
      </div>

      <form action="/catalog" className="mt-4 space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <Search size={15} />
            Поиск
          </label>
          <Input name="q" defaultValue={filters.q} placeholder="Название, зона, удобство" className="border-black/10 bg-[#fcfaf5]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
            <label className={`cursor-pointer rounded-full px-4 py-2 text-sm ${!filters.zone ? "bg-pine text-white" : "bg-mist text-ink"}`}>
              <input type="radio" name="zone" value="" defaultChecked={!filters.zone} className="sr-only" />
              Все
            </label>
            {zones.map((zone) => {
              const active = filters.zone === zone;
              return (
                <label key={zone} className={`cursor-pointer rounded-full px-4 py-2 text-sm ${active ? "bg-pine text-white" : "bg-mist text-ink"}`}>
                  <input type="radio" name="zone" value={zone} defaultChecked={active} className="sr-only" />
                  {zone}
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {toggles.map((toggle) => (
            <label key={toggle.key} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm">
              <input
                type="checkbox"
                name={toggle.key}
                value="true"
                defaultChecked={Boolean(filters[toggle.key])}
                className="peer sr-only"
              />
              <span className="grid size-5 place-items-center rounded-full border border-black/15 bg-white text-transparent peer-checked:border-pine peer-checked:bg-pine peer-checked:text-white">
                <Check size={13} />
              </span>
              {toggle.label}
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button className="flex-1 rounded-full bg-pine px-4 py-3 text-sm font-medium text-white">Применить</button>
          <Link href="/catalog" className="rounded-full bg-mist px-4 py-3 text-sm font-medium text-ink">
            Сброс
          </Link>
        </div>
      </form>
    </aside>
  );
}
