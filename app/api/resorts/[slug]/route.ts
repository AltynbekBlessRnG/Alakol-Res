import { NextResponse } from "next/server";
import { getResortBySlug } from "@/lib/resorts";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resort = await getResortBySlug(slug);

  if (!resort) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(resort);
}
