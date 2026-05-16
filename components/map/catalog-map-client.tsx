"use client";

import { useEffect, useRef } from "react";
import { escapeMapHtml, loadGoogleMaps } from "@/components/map/google-maps-loader";

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
  if (!resorts.length) return { lat: 46.14, lng: 81.6 };
  const lat = resorts.reduce((sum, item) => sum + item.latitude, 0) / resorts.length;
  const lng = resorts.reduce((sum, item) => sum + item.longitude, 0) / resorts.length;
  return { lat, lng };
}

export function CatalogMapClient({ resorts, apiKey }: { resorts: MapResort[]; apiKey?: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const map = new window.google.maps.Map(mapRef.current, {
          center: getCenter(resorts),
          zoom: 11,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        });

        const bounds = new window.google.maps.LatLngBounds();

        resorts.forEach((resort) => {
          const position = { lat: resort.latitude, lng: resort.longitude };
          bounds.extend(position);

          const marker = new window.google!.maps.Marker({
            position,
            map,
            title: resort.title
          });
          const infoWindow = new window.google!.maps.InfoWindow({
            content: `<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 220px;">
              <div style="font-weight:700;">${escapeMapHtml(resort.title)}</div>
              <div style="font-size:12px;opacity:.65;margin-top:4px;">${escapeMapHtml(resort.zone)}</div>
              <div style="margin-top:8px;">от ${new Intl.NumberFormat("ru-RU").format(resort.minPrice)} ₸</div>
              <div style="margin-top:8px;"><a href="/catalog/${encodeURIComponent(resort.slug)}" style="color:#17352c;text-decoration:underline;">Открыть карточку</a></div>
            </div>`
          });

          marker.addListener("click", () => infoWindow.open({ anchor: marker, map }));
        });

        if (resorts.length > 1) {
          map.fitBounds(bounds);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, resorts]);

  if (!apiKey) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center bg-[#edf6f2] px-6 text-center text-sm text-pine md:h-[460px]">
        Добавьте GOOGLE_MAPS_API_KEY в env.
      </div>
    );
  }

  return <div ref={mapRef} data-google-map-ready className="h-[320px] w-full md:h-[460px]" />;
}
