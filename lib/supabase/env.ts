function cleanEnv(value: string | undefined) {
  return value?.replace(/^\uFEFF/, "").trim();
}

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabasePublishableKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const supabaseServiceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseStorageBucket = cleanEnv(process.env.SUPABASE_STORAGE_BUCKET) || "resort-media";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
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
