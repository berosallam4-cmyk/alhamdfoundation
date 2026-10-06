import type { ReactNode } from "react";
import { getAllSettings } from "@/lib/settings";
import { buildMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getAllSettings();
  return buildMeta({
    title: "Donate — Alhamd Foundation",
    description: `Since ${s.founded_year} your donations have provided monthly rashan to ${s.stat_families} families and scholarships to ${s.stat_scholarships} students. Donate to Alhamd Foundation.`,
    path: "/donate",
    imageKey: "img_hero",
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
