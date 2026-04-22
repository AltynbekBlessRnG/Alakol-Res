import path from "node:path";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseAdminConfig, isSupabaseStorageConfigured } from "@/lib/supabase/env";

export async function uploadResortImagesToSupabaseStorage(resortId: string, files: File[]) {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { storageBucket } = getSupabaseAdminConfig();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${resortId}/${randomUUID()}${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(storageBucket).upload(fileName, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false
    });

    if (error) {
      throw error;
    }

    const { data: signedData, error: signedError } = await supabase.storage.from(storageBucket).createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedError || !signedData?.signedUrl) {
      const { data } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
      continue;
    }

    uploadedUrls.push(signedData.signedUrl);
  }

  return uploadedUrls;
}
