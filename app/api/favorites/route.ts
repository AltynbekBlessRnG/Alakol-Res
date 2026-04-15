import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getPublishedResortBySlug, listUserFavoriteResorts, toggleFavoriteForUser } from "@/lib/demo-data";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "USER") {
    return NextResponse.json({ authenticated: false, favorites: [], slugs: [], count: 0 });
  }

  const favorites = listUserFavoriteResorts(session.user.id);

  return NextResponse.json({
    authenticated: true,
    count: favorites.length,
    slugs: favorites.map((item) => item.slug),
    favorites
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { slug?: string };
  const slug = String(body.slug || "");
  const resort = getPublishedResortBySlug(slug);

  if (!resort) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const favorite = toggleFavoriteForUser(session.user.id, resort.id);

  return NextResponse.json({ ok: true, favorite });
}
