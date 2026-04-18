import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { appendResortImagesInSupabase, getResortByIdFromSupabase } from "@/lib/supabase/data";
import { uploadResortImagesToSupabaseStorage } from "@/lib/supabase/storage";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const resortId = String(formData.get("resortId") || "");
  const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);

  const resort = await getResortByIdFromSupabase(resortId);
  if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!files.length) {
    return NextResponse.json({ message: "No files" }, { status: 400 });
  }

  let uploadedUrls = await uploadResortImagesToSupabaseStorage(resortId, files);

  if (!uploadedUrls) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resorts", resortId);
    await fs.mkdir(uploadDir, { recursive: true });

    uploadedUrls = [];

    for (const file of files) {
      const extension = path.extname(file.name) || ".jpg";
      const fileName = `${randomUUID()}${extension}`;
      const filePath = path.join(uploadDir, fileName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, bytes);
      uploadedUrls.push(`/uploads/resorts/${resortId}/${fileName}`);
    }
  }

  await appendResortImagesInSupabase(resortId, uploadedUrls);

  return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
}
