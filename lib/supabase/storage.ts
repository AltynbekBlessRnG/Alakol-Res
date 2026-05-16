import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseAdminConfig, isSupabaseStorageConfigured } from "@/lib/supabase/env";

export type StorageUploadImage = {
  buffer: Buffer;
  extension: string;
  contentType: string;
};

export async function uploadResortImagesToSupabaseStorage(resortId: string, images: StorageUploadImage[]) {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { storageBucket } = getSupabaseAdminConfig();
  const uploadedUrls: string[] = [];

  for (const image of images) {
    const fileName = `${resortId}/${randomUUID()}${image.extension || ".webp"}`;

    const { error } = await supabase.storage.from(storageBucket).upload(fileName, image.buffer, {
      contentType: image.contentType,
      cacheControl: "31536000",
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
