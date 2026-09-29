import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ensureSeeded } from "@/lib/seedReviews";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alhamd Foundation — Serving Humanity Since 2012",
  description:
    "Alhamd Foundation provides monthly rashan to deserving families and scholarships to students. Working in the path of Allah since 2012.",
  keywords: ["Alhamd Foundation", "charity Pakistan", "rashan", "scholarship", "zakat", "sadaqah"],
  openGraph: {
    title: "Alhamd Foundation — Serving Humanity Since 2012",
    description:
      "Monthly rashan for 104+ families and scholarships for 143+ students. Donate or apply online.",
    type: "website",
  },
};

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
