"use client";

import dynamic from "next/dynamic";
import type { Resort } from "@/lib/types";

const CatalogMapClient = dynamic(
  () => import("@/components/map/catalog-map-client").then((mod) => mod.CatalogMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[1.25rem] bg-[#d9efe9] text-sm text-pine md:h-[460px]">
        Загружаем карту...
      </div>
    )
  }
);

type LakeMapProps = {
  resorts: Pick<Resort, "id" | "slug" | "title" | "zone" | "latitude" | "longitude" | "minPrice">[];
  apiKey?: string;
};

export function LakeMap({ resorts, apiKey }: LakeMapProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-white p-3 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:rounded-[2rem] md:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pine/55">Google Maps</p>
          <h3 className="font-display text-3xl text-pine">Карта объектов</h3>
        </div>
        <p className="hidden text-sm text-pine/65 md:block">{resorts.length} точек</p>
      </div>
      <div className="overflow-hidden rounded-[1.25rem] border border-black/8">
        <CatalogMapClient resorts={resorts} apiKey={apiKey} />
      </div>
    </div>
  );
}

