import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ensureSeeded } from "@/lib/seedReviews";
import { getAllSettings } from "@/lib/settings";
import { SITE_URL, buildMeta } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return {
    metadataBase: new URL(SITE_URL),
    ...buildMeta({
      title: `Alhamd Foundation — ${s.home_hero_title || "Serving Humanity Since 2012"}`,
      description: s.home_hero_text,
      path: "/",
      imageKey: "img_hero",
    }),
    keywords: ["Alhamd Foundation", "charity Pakistan", "rashan", "scholarship", "zakat", "sadaqah"],
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-stone-50 text-slate-900 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
