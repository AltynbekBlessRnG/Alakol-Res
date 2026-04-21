import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listOwnerLeadsFromSupabase, updateLeadInSupabase } from "@/lib/supabase/data";

const schema = z.object({
  status: z.enum(["new", "contacted", "no_answer", "booked", "closed"]),
  ownerComment: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "OWNER" || !session.user.ownerProfileId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = schema.parse(await request.json());
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
