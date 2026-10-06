import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alhamdfoundation.vercel.app";

function clean(text: string, max: number) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

export function buildMeta(opts: {
  title: string;
  description: string;
  path: string;
  imageKey?: string;
  imageTitle?: string;
}): Metadata {
  const description = clean(opts.description, 220);

  const cardTitle = clean(
    opts.imageTitle ||
      opts.title
        .replace(/^Alhamd Foundation\s*[—-]\s*/i, "")
        .replace(/\s*[—-]\s*Alhamd Foundation$/i, ""),
    80
  );

  const params = new URLSearchParams({
    k: opts.imageKey || "img_hero",
    t: cardTitle,
    d: clean(opts.description, 170),
    v: String(Math.floor(Date.now() / 3600000)),
  });
  const image = `${SITE_URL}/api/og?${params.toString()}`;

  return {
    title: opts.title,
    description,
    openGraph: {
      title: opts.title,
      description,
      url: opts.path,
      siteName: "Alhamd Foundation",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      images: [image],
    },
  };
}
