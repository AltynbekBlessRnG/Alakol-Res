import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAnalyticsEventInSupabase,
  createLeadInSupabase,
  createNotificationInSupabase,
  getResortByIdFromSupabase
} from "@/lib/supabase/data";
import { checkRateLimit, addRateLimitHeaders } from "@/lib/rate-limit";

const schema = z.object({
  resortId: z.string(),
  guestName: z.string().min(2),
  phone: z.string().min(5),
  note: z.string().optional()
});

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
    const data = schema.parse(await request.json());
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
      await createAnalyticsEventInSupabase({
        eventType: "lead_created",
        resortId: data.resortId,
        slug: resort.slug,
        metadata: JSON.stringify({ leadId: id })
      });
    }

    return NextResponse.json({ id, status: "new", ...data }, { status: 201, headers });
  } catch {
    return NextResponse.json({ message: "Проверьте имя и телефон." }, { status: 400, headers });
  }
}
