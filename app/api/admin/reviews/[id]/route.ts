import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { moderateReviewInSupabase } from "@/lib/supabase/data";

const schema = z.object({
  status: z.enum(["approved", "pending"])
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = schema.parse(await request.json());
  await moderateReviewInSupabase(id, body.status);
  return NextResponse.json({ ok: true, status: body.status });
}
