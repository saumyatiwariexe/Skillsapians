"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.replace("/profile");
    } else {
      setChecked(true);
    }
  }, [user, authLoading, router]);

  if (!checked && !user) {
    return <main className="w-full flex justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin text-accent-blue" /></main>;
  }

  return (
    <main className="w-full max-w-[480px] mx-auto pt-[12vh] text-center">
      <h1 className="font-display font-medium text-xl text-text-primary mb-2">My Reports</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Sign in to see the reports you've verified and saved.
      </p>
    </main>
  );
}
