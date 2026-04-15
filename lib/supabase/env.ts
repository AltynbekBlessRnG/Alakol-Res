const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || "resort-media";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function isSupabaseStorageConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey && supabaseStorageBucket);
}

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey
  };
}

export function getSupabaseAdminConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return {
    url: supabaseUrl,
    serviceRoleKey: supabaseServiceRoleKey,
    storageBucket: supabaseStorageBucket
  };
}
