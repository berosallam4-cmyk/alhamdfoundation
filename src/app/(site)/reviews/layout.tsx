import type { ReactNode } from "react";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { buildMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getAllSettings();
  const [row] = await db.select({ value: count() }).from(reviews);
  return buildMeta({
    title: "Community Reviews — Alhamd Foundation",
    description: `${row.value}+ reviews from donors, volunteers and scholarship holders since ${s.founded_year}.`,
    path: "/reviews",
    imageKey: "img_hero",
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
