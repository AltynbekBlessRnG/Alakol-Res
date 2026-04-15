import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig, isSupabaseStorageConfigured } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  const config = getSupabaseAdminConfig();

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
