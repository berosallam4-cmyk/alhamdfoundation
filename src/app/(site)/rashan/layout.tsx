import type { ReactNode } from "react";
import { getAllSettings } from "@/lib/settings";
import { buildMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getAllSettings();
  return buildMeta({
    title: "Monthly Rashan Program — Alhamd Foundation",
    description: s.rashan_intro,
    path: "/rashan",
    imageKey: "img_rashan",
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
