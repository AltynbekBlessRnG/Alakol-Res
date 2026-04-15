"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

type MapResort = {
  id: string;
  slug: string;
  title: string;
  zone: string;
  latitude: number;
  longitude: number;
  minPrice: number;
};

function getCenter(resorts: MapResort[]) {
  if (!resorts.length) return [46.14, 81.6] as [number, number];
  const lat = resorts.reduce((sum, item) => sum + item.latitude, 0) / resorts.length;
  const lng = resorts.reduce((sum, item) => sum + item.longitude, 0) / resorts.length;
  return [lat, lng] as [number, number];
}

export function CatalogMapClient({ resorts }: { resorts: MapResort[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: getCenter(resorts),
      zoom: 11,
      scrollWheelZoom: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    resorts.forEach((resort) => {
      L.circleMarker([resort.latitude, resort.longitude], {
        color: "#17352c",
        fillColor: "#a26a42",
        fillOpacity: 0.95,
        radius: 8,
        weight: 2
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: ui-sans-serif, system-ui, sans-serif;">
            <div style="font-weight:600;">${resort.title}</div>
            <div style="font-size:12px;opacity:.65;margin-top:4px;">${resort.zone}</div>
            <div style="margin-top:8px;">от ${new Intl.NumberFormat("ru-RU").format(resort.minPrice)} ₸</div>
            <div style="margin-top:8px;"><a href="/catalog/${resort.slug}" style="color:#17352c;text-decoration:underline;">Открыть карточку</a></div>
          </div>`
        );
    });

    return () => {
      map.remove();
    };
  }, [resorts]);

  return <div ref={mapRef} className="h-[320px] w-full md:h-[420px]" />;
}
