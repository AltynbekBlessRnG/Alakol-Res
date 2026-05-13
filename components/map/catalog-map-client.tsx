"use client";

import { useEffect, useRef } from "react";

type MapResort = {
  id: string;
  slug: string;
  title: string;
  zone: string;
  latitude: number;
  longitude: number;
  minPrice: number;
};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
        Marker: new (options: Record<string, unknown>) => GoogleMarker;
        InfoWindow: new (options: { content: string }) => GoogleInfoWindow;
        LatLngBounds: new () => GoogleLatLngBounds;
      };
    };
    initAlakolGoogleMap?: () => void;
  }
}

type GoogleMap = {
  fitBounds(bounds: GoogleLatLngBounds): void;
};

type GoogleMarker = {
  addListener(event: string, callback: () => void): void;
};

type GoogleInfoWindow = {
  open(options: { anchor: GoogleMarker; map: GoogleMap }): void;
};

type GoogleLatLngBounds = {
  extend(position: { lat: number; lng: number }): void;
};

const GOOGLE_MAPS_SCRIPT_ID = "alakol-google-maps-script";

function getCenter(resorts: MapResort[]) {
  if (!resorts.length) return { lat: 46.14, lng: 81.6 };
  const lat = resorts.reduce((sum, item) => sum + item.latitude, 0) / resorts.length;
  const lng = resorts.reduce((sum, item) => sum + item.longitude, 0) / resorts.length;
  return { lat, lng };
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    window.initAlakolGoogleMap = () => resolve();

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initAlakolGoogleMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[char] ?? char;
  });
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
              <div style="font-weight:700;">${escapeHtml(resort.title)}</div>
              <div style="font-size:12px;opacity:.65;margin-top:4px;">${escapeHtml(resort.zone)}</div>
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
