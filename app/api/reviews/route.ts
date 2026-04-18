import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  createNotificationInSupabase,
  createReviewInSupabase,
  getResortByIdFromSupabase,
  getUserByEmailFromSupabase
} from "@/lib/supabase/data";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    resortId?: string;
    rating?: number;
    body?: string;
  };

  const resortId = String(body.resortId || "");
  const reviewBody = String(body.body || "").trim();
  const rating = Number(body.rating || 0);
  const authorName = session.user.name?.trim() || "Гость";

  if (!resortId || !reviewBody || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const resort = await getResortByIdFromSupabase(resortId);
  if (!resort) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await createReviewInSupabase({
    resortId,
    authorName,
    body: reviewBody,
    rating,
    userId: session.user.id
  });

  const admin = await getUserByEmailFromSupabase("admin@alakol.kz");
  if (admin) {
    await createNotificationInSupabase({
      userId: admin.id,
      type: "resort_submitted",
      title: "Новый отзыв на модерации",
      body: `Поступил новый отзыв для объекта ${resort.title}.`,
      href: "/admin"
    });
  }

  return NextResponse.json({
    ok: true,
    moderation: true,
    message: "Отзыв отправлен на модерацию. Он появится в карточке после проверки."
  });
}
