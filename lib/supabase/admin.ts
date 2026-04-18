import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig, isSupabaseAdminConfigured } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
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
