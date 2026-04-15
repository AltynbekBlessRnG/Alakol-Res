import { NextRequest, NextResponse } from "next/server";
import { getCatalogResorts, parseFilters } from "@/lib/resorts";

export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const resorts = await getCatalogResorts(filters);
  return NextResponse.json(resorts);
}
