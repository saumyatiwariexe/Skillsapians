/**
 * GET /api/profile
 *
 * Returns the authenticated user's profile + aggregated report list.
 * Used by /profile to render the shareable Report Card dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getUserFromAuthorization } from "@/lib/supabase/client";
import type { ProfileResponse, ProfileReportSummary, ReportBadge } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse<ProfileResponse>> {
  const user = await getUserFromAuthorization(req.headers.get("authorization"));

  if (!user) {
    return NextResponse.json(
      { profile: null, reports: [], totals: { report_count: 0, average_score: 0, total_points: 0, badge_count: 0 }, status: "unauthorized" },
      { status: 401 }
    );
  }

  const db = createAdminClient();

  const { data: profileRow } = await db
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: reportRows } = await db
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reports: ProfileReportSummary[] = (reportRows ?? []).map((r) => ({
    report_id:        r.id,
    repo:             r.repo_url,
    skill_area:       r.skill_area ?? "overall",
    verified_skill_score: r.verified_skill_score ?? 0,
    authenticity_score:   r.authenticity_score ?? 0,
    average_question_score: 0,
    point_score:      r.point_score ?? 0,
    badge:            (r.badge as ReportBadge) ?? null,
    created_at:       r.created_at,
    completed_at:     r.completed_at ?? null,
    question_count:   0,
  }));

  const report_count = reports.length;
  const average_score = report_count
    ? Math.round(reports.reduce((s, r) => s + r.verified_skill_score, 0) / report_count)
    : 0;
  const total_points = reports.reduce((s, r) => s + r.point_score, 0);
  const badge_count = reports.filter((r) => r.badge).length;

  return NextResponse.json({
    profile: profileRow
      ? {
          user_id:    profileRow.user_id,
          username:   profileRow.username,
          full_name:  profileRow.full_name,
          avatar_url: profileRow.avatar_url,
          company:    profileRow.company,
          website:    profileRow.website,
          bio:        profileRow.bio,
          created_at: profileRow.created_at,
          updated_at: profileRow.updated_at,
        }
      : null,
    reports,
    totals: { report_count, average_score, total_points, badge_count },
    status: "ready",
  });
}
