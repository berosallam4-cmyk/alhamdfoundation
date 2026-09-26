import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ensureSeeded } from "@/lib/seedReviews";

export const metadata: Metadata = {
  metadataBase: new URL("https://alhamdfoundation.vercel.app"),
  title: "Alhamd Foundation — Serving Humanity Since 2012",
  description:
    "Alhamd Foundation provides monthly rashan to deserving families and scholarships to students. Working in the path of Allah since 2012.",
  keywords: [
    "Alhamd Foundation",
    "charity Pakistan",
    "rashan",
    "scholarship",
    "zakat",
    "sadaqah",
  ],
  openGraph: {
    title: "Alhamd Foundation — Serving Humanity Since 2012",
    description:
      "Monthly rashan for 104+ families and scholarships for 143+ students. Donate or apply online.",
    url: "https://alhamdfoundation.vercel.app",
    siteName: "Alhamd Foundation",
    type: "website",
    images: [
      {
        url: "/pic.png",
        alt: "Alhamd Foundation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alhamd Foundation — Serving Humanity Since 2012",
    description:
      "Monthly rashan for families and scholarships for students.",
    images: ["/pic.png"],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // On a brand-new database (e.g. first production deploy) this fills in the
  // 143 historical reviews and the default rashan package — safe & one-time.
  await ensureSeeded();

  return (
    <html lang="en">
      <body className="bg-stone-50 text-slate-900 antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
