import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getUserFromAuthorization } from "@/lib/supabase/client";
import { upsertProfileForUser } from "@/lib/profiles";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuthorization(req.headers.get("authorization"));

    if (!user) {
      return NextResponse.json(
        { status: "unauthorized", error: "Sign in with GitHub before saving this report." },
        { status: 401 }
      );
    }

    const { report_id } = (await req.json()) as { report_id?: string };
    if (!report_id) {
      return NextResponse.json(
        { status: "error", error: "report_id is required" },
        { status: 400 }
      );
    }

    const db = createAdminClient();
    await upsertProfileForUser(db, user);

    const { data: existingReport, error: existingError } = await db
      .from("reports")
      .select("id, user_id")
      .eq("id", report_id)
      .single();

    if (existingError || !existingReport) {
      return NextResponse.json(
        { status: "error", error: "Report not found." },
        { status: 404 }
      );
    }

    if (existingReport.user_id && existingReport.user_id !== user.id) {
      return NextResponse.json(
        { status: "error", error: "This report is already saved to another profile." },
        { status: 409 }
      );
    }

    const { error: updateError } = await db
      .from("reports")
      .update({ user_id: user.id })
      .eq("id", report_id);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ status: "saved", report_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save report.";
    console.error("[/api/profile/save-report] Error:", message);
    return NextResponse.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
