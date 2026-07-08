"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut, LayoutDashboard, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { signInWithProvider, signOut } from "@/lib/supabase/auth";
import { GitHubIcon } from "@/components/GitHubIcon";

export function UserMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "github" | "google">(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  async function handleSignIn(provider: "github" | "google") {
    setBusy(provider);
    try {
      await signInWithProvider(provider);
    } catch {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.refresh();
  }

  if (loading) {
    return <div className="w-6 h-6 rounded-full bg-subtle animate-pulse" />;
  }

  if (user) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      user.email ??
      "Account";
    const avatar = (user.user_metadata?.avatar_url as string | undefined) ?? null;

    return (
      <div className="relative" data-user-menu>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <UserCircle size={24} strokeWidth={1.5} />
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-surface border border-subtle rounded-md shadow-xl p-2 z-50">
            <div className="px-3 py-2 border-b border-subtle mb-2">
              <p className="font-body text-sm text-text-primary truncate">{name}</p>
              {user.email && (
                <p className="font-body text-xs text-text-tertiary truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={() => { setOpen(false); router.push("/profile"); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body text-text-primary hover:bg-surface-alt transition-colors text-left"
            >
              <LayoutDashboard size={16} /> My Report Card
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body text-accent-red hover:bg-surface-alt transition-colors text-left"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Sign in"
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full"
      >
        <UserCircle size={24} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface border border-subtle rounded-md shadow-xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-medium text-sm text-text-primary">Sign in</h3>
            <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          <p className="font-body text-xs text-text-secondary mb-4 leading-relaxed">
            Save your verified reports to a shareable Report Card.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSignIn("github")}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 bg-canvas border border-subtle rounded-md px-4 py-2.5 font-body text-sm text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-50"
            >
              <GitHubIcon size={16} /> {busy === "github" ? "Redirecting…" : "Continue with GitHub"}
            </button>
            <button
              onClick={() => handleSignIn("google")}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 bg-canvas border border-subtle rounded-md px-4 py-2.5 font-body text-sm text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.7S6.9 20.9 12 20.9c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"/></svg>
              {busy === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
