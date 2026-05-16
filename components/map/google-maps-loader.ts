"use client";

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

export type GoogleMap = {
  fitBounds(bounds: GoogleLatLngBounds): void;
};

export type GoogleMarker = {
  addListener(event: string, callback: () => void): void;
};

export type GoogleInfoWindow = {
  open(options: { anchor: GoogleMarker; map: GoogleMap }): void;
};

export type GoogleLatLngBounds = {
  extend(position: { lat: number; lng: number }): void;
};

const GOOGLE_MAPS_SCRIPT_ID = "alakol-google-maps-script";

export function loadGoogleMaps(apiKey: string) {
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

export function escapeMapHtml(value: string) {
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
