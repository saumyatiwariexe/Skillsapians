"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { signInWithProvider, signOut, supabase } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/Button";
import { GitHubIcon } from "@/components/GitHubIcon";
import { Loader2, Award, Star, ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import type { ProfileResponse, ProfileReportSummary, ReportBadge } from "@/types";

const BADGE_TONE: Record<ReportBadge["tone"], string> = {
  green:  "bg-accent-green/10 text-accent-green border-accent-green/30",
  blue:   "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
  yellow: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30",
  red:    "bg-accent-red/10 text-accent-red border-accent-red/30",
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData]     = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuth, setNotAuth] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNotAuth(true);
      setLoading(false);
      return;
    }

    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch("/api/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = (await res.json()) as ProfileResponse;
      if (json.status === "unauthorized") {
        setNotAuth(true);
      } else {
        setData(json);
      }
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  async function handleSignOut() {
    await signOut();
    router.push("/verify");
  }

  if (loading) {
    return <main className="w-full flex justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin text-accent-blue" /></main>;
  }

  if (notAuth || !user) {
    return (
      <main className="w-full max-w-[480px] mx-auto pt-[12vh]">
        <section className="bg-surface border border-subtle rounded-md p-8 text-center">
          <div className="w-14 h-14 bg-accent-blue/15 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-5">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <h1 className="font-display font-medium text-xl text-text-primary mb-2">Your Report Card</h1>
          <p className="font-body text-sm text-text-secondary mb-6">
            Sign in to view your aggregated, shareable skill Report Card.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={() => signInWithProvider("github")} className="w-full flex items-center justify-center gap-2 bg-canvas border border-subtle rounded-md px-4 py-2.5 font-body text-sm text-text-primary hover:bg-surface-alt transition-colors">
              <GitHubIcon size={16} /> Continue with GitHub
            </button>
            <button onClick={() => signInWithProvider("google")} className="w-full flex items-center justify-center gap-2 bg-canvas border border-subtle rounded-md px-4 py-2.5 font-body text-sm text-text-primary hover:bg-surface-alt transition-colors">
              <Star size={16} /> Continue with Google
            </button>
          </div>
        </section>
      </main>
    );
  }

  const profile = data?.profile ?? null;
  const reports: ProfileReportSummary[] = data?.reports ?? [];
  const totals = data?.totals ?? { report_count: 0, average_score: 0, total_points: 0, badge_count: 0 };
  const name = profile?.full_name ?? profile?.username ?? (user.user_metadata?.name as string | undefined) ?? user.email ?? "Developer";
  const avatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <main className="w-full max-w-[840px] mx-auto pb-24">
      {/* Report Card header */}
      <header className="bg-surface border border-subtle rounded-md p-8 mb-8">
        <div className="flex items-start gap-5">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover border border-subtle" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center font-display font-bold text-2xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-display font-medium text-2xl text-text-primary">{name}</h1>
            {profile?.company && <p className="font-body text-sm text-text-secondary">{profile.company}</p>}
            {profile?.username && <p className="font-body text-xs text-text-tertiary">@{profile.username}</p>}
          </div>
          <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 text-text-tertiary hover:text-accent-red transition-colors text-xs font-body">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Stat label="Reports" value={`${totals.report_count}`} />
          <Stat label="Avg Score" value={`${totals.average_score}`} />
          <Stat label="Total Points" value={`${totals.total_points}`} />
          <Stat label="Badges" value={`${totals.badge_count}`} />
        </div>
      </header>

      <h2 className="font-display font-medium text-[15px] text-text-primary mb-4 pb-2 border-b border-subtle">
        Verified Reports
      </h2>

      {reports.length === 0 ? (
        <div className="bg-surface border border-subtle rounded-md p-10 text-center">
          <p className="font-body text-sm text-text-secondary mb-5">No reports yet. Complete a verification to build your Report Card.</p>
          <Button onClick={() => router.push("/verify")}>Start a verification</Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((r) => (
            <li key={r.report_id} className="bg-surface border border-subtle rounded-md p-5 flex items-center gap-4 hover:border-text-tertiary transition-colors">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-md bg-canvas border border-subtle shrink-0">
                <span className="font-display font-bold text-xl text-text-primary leading-none">{r.verified_skill_score}</span>
                <span className="font-body text-[10px] text-text-tertiary mt-1">score</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a href={`https://${r.repo}`} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-text-primary truncate hover:underline inline-flex items-center gap-1">
                    {r.repo.replace(/^https?:\/\//, "")} <ExternalLink className="w-3 h-3 text-text-tertiary" />
                  </a>
                </div>
                <p className="font-body text-xs text-text-tertiary capitalize">{r.skill_area}</p>
                {r.badge && (
                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full border font-body text-[11px] ${BADGE_TONE[r.badge.tone]}`}>
                    <Award className="w-3 h-3" /> {r.badge.label}
                  </span>
                )}
              </div>
              <Button variant="secondary" className="shrink-0" onClick={() => router.push(`/report/${r.report_id}`)}>
                View
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas border border-subtle rounded-md p-3 text-center">
      <p className="font-display font-bold text-2xl text-text-primary leading-none">{value}</p>
      <p className="font-body text-[11px] text-text-tertiary mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
