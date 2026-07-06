import { supabase } from "./client";

export type AuthProvider = "github" | "google";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Kick off a Supabase OAuth sign-in (GitHub or Google).
 * Redirects the browser to the provider, then back to /api/auth/callback.
 */
export async function signInWithProvider(provider: AuthProvider): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export { supabase };
