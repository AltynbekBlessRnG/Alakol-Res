import { NextResponse } from "next/server";
import { createAnalyticsEvent } from "@/lib/demo-data";

export async function POST(request: Request) {
  const body = await request.json();
  createAnalyticsEvent({
    eventType: String(body.eventType || "unknown"),
    resortId: body.resortId ? String(body.resortId) : undefined,
    slug: body.slug ? String(body.slug) : undefined,
    metadata: body.metadata ? JSON.stringify(body.metadata) : undefined
  });
  return NextResponse.json({ ok: true });
}
