import { sendEmail } from "@/lib/mailer";
import { getAllSettings, type SettingsMap } from "@/lib/settings";

export type TemplateKey =
  | "new_admin"
  | "new_student"
  | "approve"
  | "reject"
  | "lucky"
  | "withdraw";

export const TEMPLATE_LIST: {
  key: TemplateKey;
  label: string;
  desc: string;
}[] = [
  {
    key: "new_admin",
    label: "New Application → Foundation",
    desc: "Sent to the foundation's notification email whenever a student submits a new application.",
  },
  {
    key: "new_student",
    label: "New Application → Student",
    desc: "Confirmation sent to the student right after they submit their application.",
  },
  {
    key: "approve",
    label: "Application Approved",
    desc: "Sent when you press the Approve button on an application.",
  },
  {
    key: "reject",
    label: "Application Rejected",
    desc: "Sent when you press the Reject button on an application.",
  },
  {
    key: "lucky",
    label: "Lucky Draw / Selected",
    desc: "Sent when a student is selected in the draw or marked as Selected.",
  },
  {
    key: "withdraw",
    label: "Withdrawn / Cancelled",
    desc: "Sent when an approved or selected student is moved back to pending.",
  },
];

export type TemplateVars = Record<string, string | number | null | undefined>;

/** Replaces {{name}}, {{id}} etc. with real values */
export function fillTemplate(text: string, vars: TemplateVars): string {
  return String(text || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Wraps plain text in a clean, professional HTML email layout */
export function buildHtml(plainBody: string, settings: SettingsMap): string {
  const title = settings.email_brand_title || "Alhamd Foundation";
  const tagline = settings.email_brand_tagline || "Serving Humanity Since 2012";
  const footer =
    settings.email_footer || "Alhamd Foundation • alhamdfoundation2012@gmail.com";

  const paragraphs = escapeHtml(plainBody)
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#334155;">${p.replace(
          /\n/g,
          "<br />"
        )}</p>`
    )
    .join("");

  return `
  <div style="background-color:#f1f5f9;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background-color:#064e3b;padding:22px;text-align:center;">
        <h2 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:0.3px;">${escapeHtml(
          title
        )}</h2>
        <p style="margin:6px 0 0 0;font-size:12px;color:#fde68a;">${escapeHtml(
          tagline
        )}</p>
      </div>
      <div style="padding:26px 26px 10px 26px;">
        ${paragraphs}
      </div>
      <div style="border-top:1px solid #e2e8f0;padding:14px 26px;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">${escapeHtml(
          footer
        )}</p>
      </div>
    </div>
  </div>`;
}

/**
 * Sends one of the admin-editable templates.
 * Returns { skipped: true } if the admin turned that template OFF.
 */
export async function sendTemplateEmail(opts: {
  key: TemplateKey;
  to: string;
  vars: TemplateVars;
  settings?: SettingsMap;
}): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const settings = opts.settings ?? (await getAllSettings());

  if (settings[`tpl_${opts.key}_enabled`] === "false") {
    return { success: true, skipped: true };
  }

  const subject = fillTemplate(settings[`tpl_${opts.key}_subject`] || "", opts.vars);
  const bodyText = fillTemplate(settings[`tpl_${opts.key}_body`] || "", opts.vars);

  if (!opts.to || !subject.trim() || !bodyText.trim()) {
    return { success: false, error: "Template is empty" };
  }

  return sendEmail({
    to: opts.to,
    subject,
    html: buildHtml(bodyText, settings),
    text: bodyText,
  });
}
