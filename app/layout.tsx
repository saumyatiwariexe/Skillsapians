import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
