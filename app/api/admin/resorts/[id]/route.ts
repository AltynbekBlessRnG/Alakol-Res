import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  addModerationReviewInSupabase,
  createNotificationInSupabase,
  getResortCompleteness,
  getResortByIdFromSupabase,
  setResortFeaturedInSupabase,
  updateResortRecordInSupabase
} from "@/lib/supabase/data";
import { adminResortActionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = adminResortActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const body = parsed.data;

  if (body.type === "featured") {
    await setResortFeaturedInSupabase(id, body.featured);
    return NextResponse.json({ ok: true, featured: body.featured });
  }

  const resort = await getResortByIdFromSupabase(id);
  if (!resort) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const completeness = getResortCompleteness(resort);
  if (body.action === "publish" && !completeness.isReady) {
    return NextResponse.json(
      { message: "Карточка пока неполная.", missing: completeness.missing },
      { status: 400 }
    );
  }

  const nextStatus = body.action === "publish" ? "PUBLISHED" : "REJECTED";
  await updateResortRecordInSupabase(id, {
    ...resort,
    status: nextStatus,
    updatedAt: new Date()
  });
  await addModerationReviewInSupabase({
    resortId: id,
    adminId: session.user.id,
    action: body.action,
    comment: body.comment
  });

  if (resort.ownerProfile?.userId) {
    await createNotificationInSupabase({
      userId: resort.ownerProfile.userId,
      type: body.action === "publish" ? "resort_published" : "resort_rejected",
      title: body.action === "publish" ? "Объект опубликован" : "Нужна доработка карточки",
      body:
        body.action === "publish"
          ? `${resort.title} теперь доступен в каталоге.`
          : `${resort.title} возвращён на доработку.`,
      href: `/owner/resorts/${resort.id}`
    });
  }

  return NextResponse.json({
    ok: true,
    status: nextStatus,
    action: body.action
  });
}
