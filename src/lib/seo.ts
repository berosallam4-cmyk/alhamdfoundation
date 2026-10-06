import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alhamdfoundation.vercel.app";

export function buildMeta(opts: {
  title: string;
  description: string;
  path: string;
  imageKey?: string;
}): Metadata {
  const description = opts.description.replace(/\s+/g, " ").trim().slice(0, 220);
  const hourStamp = Math.floor(Date.now() / 3600000);
  const image = `${SITE_URL}/api/og?k=${opts.imageKey || "img_hero"}&v=${hourStamp}`;

  return {
    title: opts.title,
    description,
    openGraph: {
      title: opts.title,
      description,
      url: opts.path,
      siteName: "Alhamd Foundation",
      type: "website",
      images: [{ url: image, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      images: [image],
    },
  };
}
