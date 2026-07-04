import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────────────────────────────────────
// Public Supabase client (browser-safe, uses ANON key)
// Use for read-only operations in client components
// ──────────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.local.example → .env.local and fill in your keys."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────────────────────────────────────
// Admin Supabase client (server-side only — bypasses Row Level Security)
// ONLY use in API routes (app/api/**). Never import in client components.
// ──────────────────────────────────────────────────────────────────────────────
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Required for server-side DB writes."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
