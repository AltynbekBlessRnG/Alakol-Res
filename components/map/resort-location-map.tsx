"use client";

import dynamic from "next/dynamic";

const ResortLocationMapClient = dynamic(
  () => import("@/components/map/resort-location-map-client").then((mod) => mod.ResortLocationMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-[2rem] bg-white/60 text-sm text-pine md:h-[540px]">
        Загружаем карту...
      </div>
    )
  }
);

type ResortLocationMapProps = {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
};

export function ResortLocationMap(props: ResortLocationMapProps) {
  return <ResortLocationMapClient {...props} />;
}
