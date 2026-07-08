import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { AuthProvider } from "@/components/AuthProvider";
import { UserMenu } from "@/components/UserMenu";

const displayFont = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Skillsapians — Verified Skill Certification",
  description:
    "Verified skill certification from real, existing work — not another test. Submit your GitHub repo and prove what you actually built.",
  keywords: ["skills verification", "github", "developer certification", "portfolio"],
  openGraph: {
    title: "Skillsapians",
    description: "Prove your skills from the work you already built.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body className="antialiased font-body bg-canvas text-text-primary min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {/* Navigation */}
          <header className="border-b border-subtle bg-surface px-6 h-14 flex items-center justify-between shrink-0 sticky top-0 z-50">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-display font-bold text-lg tracking-tight text-text-primary">
                Skillsapians
              </Link>
              
              <nav className="flex items-center gap-6">
                <Link href="/reports" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                  My Reports
                </Link>
                <Link href="/verify" className="text-text-primary border-b-2 border-accent-blue translate-y-[1px] pb-[17px] mt-[17px] text-sm font-medium">
                  New Verification
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
