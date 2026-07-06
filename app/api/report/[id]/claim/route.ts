/**
 * POST /api/report/[id]/claim
 *
 * Associates an already-completed report with the authenticated user,
 * so it shows up on their Profile "Report Card" dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getUserFromAuthorization } from "@/lib/supabase/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ status: "ok" | "error"; error?: string }>> {
  const { id } = await params;
  const user = await getUserFromAuthorization(req.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ status: "error", error: "Not authenticated" }, { status: 401 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from("reports")
    .update({ user_id: user.id })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
