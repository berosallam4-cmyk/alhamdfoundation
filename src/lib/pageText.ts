import type { SettingsMap } from "@/lib/settings";

// {families}, {scholarships} jaise shortcodes ko asli numbers se badalta hai
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m
  );
}

// Admin ne box khali chhora ho to default text chalega
export function pick(value: string | undefined | null, fallback: string) {
  return value && value.trim() ? value : fallback;
}

export function textVars(
  s: SettingsMap,
  reviewCount?: number
): Record<string, string | number> {
  return {
    families: s.stat_families,
    scholarships: s.stat_scholarships,
    years: s.stat_years,
    fee: s.application_fee,
    reviews: reviewCount ?? "",
    founded: s.founded_year,
  };
}
