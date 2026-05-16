"use client";

import { useEffect, useRef } from "react";
import { escapeMapHtml, loadGoogleMaps } from "@/components/map/google-maps-loader";

type ResortLocationMapClientProps = {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  apiKey?: string;
};

export function ResortLocationMapClient({ title, address, latitude, longitude, apiKey }: ResortLocationMapClientProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const position = { lat: latitude, lng: longitude };
        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 14,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        });

        const marker = new window.google.maps.Marker({
          position,
          map,
          title
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 220px;">
            <div style="font-weight:700;">${escapeMapHtml(title)}</div>
            <div style="font-size:12px;opacity:.65;margin-top:4px;">${escapeMapHtml(address)}</div>
          </div>`
        });

        marker.addListener("click", () => infoWindow.open({ anchor: marker, map }));
        infoWindow.open({ anchor: marker, map });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [address, apiKey, latitude, longitude, title]);

  if (!apiKey) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center bg-[#edf6f2] px-6 text-center text-sm text-pine md:h-[540px]">
        Добавьте GOOGLE_MAPS_API_KEY в env.
      </div>
    );
  }

  return <div ref={mapRef} data-google-map-ready className="h-[360px] w-full md:h-[540px]" />;
}
