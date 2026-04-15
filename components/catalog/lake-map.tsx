"use client";

import dynamic from "next/dynamic";
import { Resort } from "@/lib/demo-data";

const CatalogMapClient = dynamic(
  () => import("@/components/map/catalog-map-client").then((mod) => mod.CatalogMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[2rem] bg-[#d9efe9] text-sm text-pine md:h-[420px]">
        Загружаем карту...
      </div>
    )
  }
);

type LakeMapProps = {
  resorts: Pick<Resort, "id" | "slug" | "title" | "zone" | "latitude" | "longitude" | "minPrice">[];
};

export function LakeMap({ resorts }: LakeMapProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_18px_70px_rgba(14,26,31,0.08)] md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pine/55">Lake view</p>
          <h3 className="font-display text-3xl text-pine">Карта береговой линии</h3>
        </div>
        <p className="max-w-xs text-sm text-pine/70">
          Реальная интерактивная карта с маркерами объектов. На телефоне она остаётся ниже фильтров, чтобы не ломать сценарий выбора.
        </p>
      </div>
      <CatalogMapClient resorts={resorts} />
    </div>
  );
}
