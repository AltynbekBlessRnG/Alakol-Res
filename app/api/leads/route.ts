import { NextResponse } from "next/server";
import {
  createAnalyticsEventInSupabase,
  createLeadInSupabase,
  createNotificationInSupabase,
  getResortByIdFromSupabase
} from "@/lib/supabase/data";
import { checkRateLimit, addRateLimitHeaders } from "@/lib/rate-limit";
import { notifyLeadToTelegram } from "@/lib/telegram";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, { prefix: "leads", maxRequests: 5 });

  const headers = new Headers();
  addRateLimitHeaders(headers, rateLimit);

  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Слишком много заявок. Попробуйте позже." },
      { status: 429, headers }
    );
  }

  try {
    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Проверьте имя и телефон." }, { status: 400, headers });
    }

    const data = parsed.data;
    const id = await createLeadInSupabase(data);
    const resort = await getResortByIdFromSupabase(data.resortId);

    if (resort?.ownerProfile?.userId) {
      await createNotificationInSupabase({
        userId: resort.ownerProfile.userId,
        type: "lead_created",
        title: "Новая заявка",
        body: `${data.guestName} оставил заявку по объекту ${resort.title}.`,
        href: "/owner"
      });
    }

    if (resort) {
      await createAnalyticsEventInSupabase({
        eventType: "lead_created",
        resortId: data.resortId,
        slug: resort.slug,
        metadata: JSON.stringify({ leadId: id })
      });
    }

    await notifyLeadToTelegram({
      leadId: id,
      resortTitle: resort?.title,
      guestName: data.guestName,
      phone: data.phone,
      note: data.note
    });

    return NextResponse.json({ id, status: "new", ...data }, { status: 201, headers });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ message: "Не удалось отправить заявку. Попробуйте еще раз." }, { status: 400, headers });
  }
}

