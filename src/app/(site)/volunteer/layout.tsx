import type { ReactNode } from "react";
import { getAllSettings } from "@/lib/settings";
import { buildMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getAllSettings();
  return buildMeta({
    title: "Become a Volunteer — Alhamd Foundation",
    description: s.volunteer_intro,
    path: "/volunteer",
    imageKey: "img_volunteer",
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
