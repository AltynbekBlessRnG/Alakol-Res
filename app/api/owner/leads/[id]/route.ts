import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { listOwnerLeadsFromSupabase, updateLeadInSupabase } from "@/lib/supabase/data";
import { ownerLeadUpdateSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "OWNER" || !session.user.ownerProfileId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = ownerLeadUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const body = parsed.data;
  const lead = (await listOwnerLeadsFromSupabase(session.user.ownerProfileId)).find((item) => item.id === id);
  if (!lead) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await updateLeadInSupabase(id, {
    status: body.status,
    ownerComment: body.ownerComment
  });

  return NextResponse.json({ ok: true, status: body.status });
}
