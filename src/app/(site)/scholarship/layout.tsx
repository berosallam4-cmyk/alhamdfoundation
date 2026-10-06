import type { ReactNode } from "react";
import { getAllSettings } from "@/lib/settings";
import { buildMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getAllSettings();

  const raw = (s.scholarship_deadline || "").trim();
  const d = raw ? new Date(raw.length === 16 ? `${raw}:00+05:00` : raw) : null;
  const valid = d && !Number.isNaN(d.getTime());
  const passed = valid ? Date.now() > d!.getTime() : false;
  const published = s.scholarship_results_published === "true";

  let description: string;
  if (published) {
    description = `${s.scholarship_result_title}. ${s.scholarship_result_message}`;
  } else if (passed) {
    description = s.scholarship_closed_message;
  } else {
    const when = valid
      ? d!.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "long" })
      : "";
    description = `Apply for the Alhamd Foundation university scholarship. Application fee Rs. ${s.application_fee}.${
      when ? ` Registration closes on ${when}.` : ""
    } ${s.stat_scholarships} students already supported.`;
  }

  return buildMeta({
    title: "Scholarship Program — Alhamd Foundation",
    description,
    path: "/scholarship",
    imageKey: "img_scholarship",
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
