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
      <div className="flex h-[280px] items-center justify-center rounded-[1.25rem] bg-[#d9efe9] text-sm text-pine">
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
    <section className="rounded-[1.35rem] border border-black/8 bg-white p-4 shadow-[0_12px_36px_rgba(14,26,31,0.08)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#edf6f2] text-pine">
            <Map size={17} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Карта объектов</span>
            <span className="mt-0.5 block text-xs text-black/52">{resorts.length} точек, открывается отдельно</span>
          </span>
        </span>
        <ChevronDown size={18} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/6">
          <CatalogMapClient resorts={resorts} />
        </div>
      )}
    </section>
  );
}
