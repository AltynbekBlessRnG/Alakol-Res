import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  createNotificationInSupabase,
  createReviewInSupabase,
  getResortByIdFromSupabase,
  getUserByEmailFromSupabase
} from "@/lib/supabase/data";
import { checkRateLimit, addRateLimitHeaders } from "@/lib/rate-limit";
import { reviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, { prefix: "reviews", maxRequests: 5 });
  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimit);

  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Слишком много отзывов. Попробуйте позже." },
      { status: 429, headers }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers });
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Проверьте текст отзыва и оценку." }, { status: 400, headers });
  }

  const { resortId, body: reviewBody, rating } = parsed.data;
  const authorName = session.user.name?.trim() || "Гость";

  const resort = await getResortByIdFromSupabase(resortId);
  if (!resort) {
    return NextResponse.json({ message: "Объект не найден" }, { status: 404, headers });
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
  }, { headers });
}

