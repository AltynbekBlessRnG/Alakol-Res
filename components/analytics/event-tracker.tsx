"use client";

import { useEffect } from "react";

export function EventTracker({
  eventType,
  resortId,
  slug,
  metadata
}: {
  eventType: string;
  resortId?: string;
  slug?: string;
  metadata?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, resortId, slug, metadata })
    });
  }, [eventType, resortId, slug, metadata]);

  return null;
}
