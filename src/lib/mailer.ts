import nodemailer from "nodemailer";
import { getAllSettings } from "./settings";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string; simulated?: boolean }> {
  try {
    const settings = await getAllSettings();
    const host = settings.smtp_host || "smtp.gmail.com";
    const port = parseInt(settings.smtp_port || "465", 10);
    const user = settings.smtp_user || "alhamdfoundation2012@gmail.com";
    const pass = settings.smtp_pass || "";
    const from = settings.smtp_from || `Alhamd Foundation <${user}>`;
    const isEnabled = settings.email_enabled === "true" && pass.trim().length > 0;

    if (!isEnabled) {
      console.log(`[Email Simulation (SMTP pass not set)] To: ${to} | Subject: ${subject}`);
      return {
        success: true,
        simulated: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: `
  <div style="text-align:center;padding:16px 8px 12px;font-family:Arial,sans-serif;">
    <img
      src="https://alhamdfoundation.vercel.app/logo.png"
      alt="Alhamd Foundation"
      width="200"
      style="display:block;width:200px;max-width:90%;height:auto;margin:0 auto;border:0;"
    />
  </div>
  ${html}
`,
      text: text || html.replace(/<[^>]*>/g, " "),
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
