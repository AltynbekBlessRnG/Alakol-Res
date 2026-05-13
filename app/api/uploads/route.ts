import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { appendResortImagesInSupabase, getResortByIdFromSupabase } from "@/lib/supabase/data";
import { uploadResortImagesToSupabaseStorage } from "@/lib/supabase/storage";
import { resortUploadSchema } from "@/lib/validation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_REQUEST = 10;

const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
} as const;

const MAGIC_BYTES: Record<string, Buffer> = {
  "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
  "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  "image/webp": Buffer.from([0x52, 0x49, 0x46, 0x46])
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
    .substring(0, 100);
}

function isValidExtension(extension: string): extension is ".jpg" | ".png" | ".webp" {
  return [".jpg", ".jpeg", ".png", ".webp"].includes(extension.toLowerCase());
}

function getExtensionFromMime(mimeType: string): ".jpg" | ".png" | ".webp" | null {
  const ext = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
  return ext || null;
}

async function validateFile(file: File): Promise<{ valid: true; safeName: string; extension: ".jpg" | ".png" | ".webp" } | { valid: false; error: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large: ${file.name}. Max size is 5MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: `Empty file: ${file.name}` };
  }

  const declaredMime = file.type;
  const validMime = getExtensionFromMime(declaredMime);
  if (!validMime) {
    return { valid: false, error: `Invalid file type: ${declaredMime}. Allowed: JPEG, PNG, WebP.` };
  }

  const originalExt = path.extname(file.name);
  if (!isValidExtension(originalExt)) {
    return { valid: false, error: `Invalid extension: ${originalExt}` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const magic = MAGIC_BYTES[declaredMime as keyof typeof MAGIC_BYTES];
  if (magic && !buffer.subarray(0, magic.length).equals(magic)) {
    return { valid: false, error: `File signature mismatch: ${file.name}. Possible fake extension.` };
  }

  const safeName = sanitizeFilename(path.basename(file.name, originalExt));

  return { valid: true, safeName, extension: validMime };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = resortUploadSchema.safeParse({ resortId: formData.get("resortId") });
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid resortId" }, { status: 400 });
    }
    const { resortId } = parsed.data;

    const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);

    if (!files.length) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json({ message: `Too many files. Max: ${MAX_FILES_PER_REQUEST}` }, { status: 400 });
    }

    const resort = await getResortByIdFromSupabase(resortId);
    if (!resort || resort.ownerProfileId !== session.user.ownerProfileId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const validatedFiles: { file: File; safeName: string; extension: ".jpg" | ".png" | ".webp" }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = await validateFile(file);
      if (result.valid) {
        validatedFiles.push({ file, safeName: result.safeName, extension: result.extension });
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ message: "Validation failed", errors }, { status: 400 });
    }

    const validatedFileObjects = validatedFiles.map(({ file }) => file);
    let uploadedUrls = await uploadResortImagesToSupabaseStorage(resortId, validatedFileObjects);

    if (!uploadedUrls) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resorts", resortId);
      await fs.mkdir(uploadDir, { recursive: true });

      uploadedUrls = [];

      for (const { file, extension } of validatedFiles) {
        const fileName = `${randomUUID()}${extension}`;
        const filePath = path.join(uploadDir, fileName);
        const bytes = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, bytes);
        uploadedUrls.push(`/uploads/resorts/${resortId}/${fileName}`);
      }
    }

    await appendResortImagesInSupabase(resortId, uploadedUrls);

    return NextResponse.json({ urls: uploadedUrls, uploaded: uploadedUrls.length }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
