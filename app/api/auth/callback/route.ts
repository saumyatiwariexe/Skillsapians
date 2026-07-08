/**
 * GET /api/auth/callback
 *
 * Supabase OAuth redirect target. Exchanges the auth code for a session,
 * ensures the user's profile row exists, then sends them to /profile.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/profile";

  if (next && !next.startsWith("/")) {
    next = "/profile";
  }

  const base = APP_URL || origin;

  if (code) {
    const { createServerClient } = await import("@supabase/ssr");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const u = data.user;
      const db = createAdminClient();

      const name =
        (u.user_metadata?.full_name as string | undefined) ??
        (u.user_metadata?.name as string | undefined) ??
        u.email?.split("@")[0] ??
        null;
      const avatar =
        (u.user_metadata?.avatar_url as string | undefined) ??
        (u.user_metadata?.picture as string | undefined) ??
        null;
      const username =
        (u.user_metadata?.user_name as string | undefined) ??
        (u.user_metadata?.preferred_username as string | undefined) ??
        (u.email ? u.email.split("@")[0] : null);

      await db.from("profiles").upsert(
        {
          user_id: u.id,
          username,
          full_name: name,
          avatar_url: avatar,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/?auth_error=1`);
}
