"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

type ResortLocationMapClientProps = {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
};

export function ResortLocationMapClient({ title, address, latitude, longitude }: ResortLocationMapClientProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      scrollWheelZoom: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.circleMarker([latitude, longitude], {
      color: "#17352c",
      fillColor: "#4db0cb",
      fillOpacity: 0.95,
      radius: 10,
      weight: 2
    })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: ui-sans-serif, system-ui, sans-serif;">
          <div style="font-weight:600;">${title}</div>
          <div style="font-size:12px;opacity:.65;margin-top:4px;">${address}</div>
        </div>`
      )
      .openPopup();

    return () => {
      map.remove();
    };
  }, [address, latitude, longitude, title]);

  return <div ref={mapRef} className="h-[360px] w-full md:h-[540px]" />;
}
