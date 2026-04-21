"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ChevronDown, Map } from "lucide-react";
import type { Resort } from "@/lib/types";

const CatalogMapClient = dynamic(
  () => import("@/components/map/catalog-map-client").then((mod) => mod.CatalogMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[2rem] bg-[#d9efe9] text-sm text-pine">
        Загружаем карту...
      </div>
    )
  }
);

type MobileMapPanelProps = {
  resorts: Pick<Resort, "id" | "slug" | "title" | "zone" | "latitude" | "longitude" | "minPrice">[];
};

export function MobileMapPanel({ resorts }: MobileMapPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-[0_18px_70px_rgba(14,26,31,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pine/55">Карта</p>
          <h2 className="mt-2 font-display text-3xl text-pine">Объекты на карте</h2>
          <p className="mt-2 text-sm leading-6 text-pine/70">
            На телефоне карта открывается отдельно, чтобы фильтры и карточки не мешали сценарию выбора.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="interactive-surface inline-flex items-center gap-2 rounded-full bg-[#f7f1e6] px-4 py-3 text-sm font-medium text-pine"
          aria-expanded={open}
        >
          <Map size={16} />
          {open ? "Скрыть" : "Показать"}
          <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-black/6">
          <CatalogMapClient resorts={resorts} />
        </div>
      )}
    </section>
  );
}
