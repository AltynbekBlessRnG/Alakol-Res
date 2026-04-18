import { NextResponse } from "next/server";
import { z } from "zod";
import { createLeadInSupabase } from "@/lib/supabase/data";

const schema = z.object({
  resortId: z.string(),
  guestName: z.string().min(2),
  phone: z.string().min(5),
  note: z.string().optional()
});

export async function POST(request: Request) {
  const data = schema.parse(await request.json());
  const id = await createLeadInSupabase(data);
  return NextResponse.json({ id, status: "new", ...data }, { status: 201 });
}
