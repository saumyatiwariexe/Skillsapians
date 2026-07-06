import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function profilePayloadFromUser(user: User) {
  const metadata = user.user_metadata ?? {};

  return {
    user_id: user.id,
    username: firstString(metadata.user_name, metadata.preferred_username, metadata.name, user.email),
    full_name: firstString(metadata.full_name, metadata.name),
    avatar_url: firstString(metadata.avatar_url, metadata.picture),
    company: firstString(metadata.company),
    website: firstString(metadata.website, metadata.blog),
    bio: firstString(metadata.bio),
    updated_at: new Date().toISOString(),
  };
}

export async function upsertProfileForUser(
  db: SupabaseClient,
  user: User
): Promise<Profile> {
  const payload = profilePayloadFromUser(user);
  const { data, error } = await db
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save profile.");
  }

  return data as Profile;
}
