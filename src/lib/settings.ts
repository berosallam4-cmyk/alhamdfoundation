\import { db } from "@/db";
import { settings } from "@/db/schema";

export const SETTING_DEFAULTS: Record<string, string> = {
  // Foundation statistics (shown on public site, editable in admin)
  stat_families: "104",
  stat_scholarships: "143",
  stat_years: "14",
  founded_year: "2012",

  // Scholarship
  next_announcement: "Next scholarship announcement: after 6 months (announced twice a year)",
  application_fee: "300",
  scholarship_note:
    "Har 6 mahine baad Alhamd Foundation selected students ka scholarship announcement karti hai — jo students select hotay hain, un sab ko scholarship milti hai (InshaAllah). Application fee sirf 300 PKR per student hai.",

  // Payment details (changeable from admin) - single primary payment method
  payment_method_type: "JazzCash", // JazzCash | EasyPaisa | Bank Transfer | Other
  payment_account_title: "Alhamd Foundation",
  payment_account_number: "0300-0000000",
  payment_bank_name: "Meezan Bank", // only if method is Bank Transfer
  payment_note: "After sending your payment, please upload the screenshot below.",

  // Donation page ayat
  donate_ayat:
    "مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ",
  donate_ayat_translation:
    "The example of those who spend their wealth in the way of Allah is like a seed of grain that sprouts seven ears; in every ear there are a hundred grains. And Allah multiplies (the reward) for whom He wills. (Surah Al-Baqarah 2:261)",
  donate_ayat_urdu:
    "جو لوگ اپنا مال اللہ کی راہ میں خرچ کرتے ہیں ان کی مثال اس دانے کی سی ہے جس سے سات بالیں اگیں اور ہر بالی میں سو دانے ہوں، اور اللہ جس کے لیے چاہے بڑھا دیتا ہے۔ (سورۃ البقرہ ۲۶۱)",

  // Editable page content
  home_hero_title: "Serving Humanity Since 2012",
  home_hero_text:
    "Alhamd Foundation has been working locally for 14 years — providing monthly rashan to 104 families and scholarships to 143 deserving students. Your donation changes lives.",
  rashan_intro:
    "Every month Alhamd Foundation delivers a complete rashan package to deserving families. Below is exactly what one family receives, with current market prices.",
  volunteer_intro:
    "Young people from any city who want to work in the path of Allah can join Alhamd Foundation. Joining is completely FREE — no fee at all.",

  // Website Images (Customizable from Admin)
  img_hero: "/images/hero.jpg",
  img_rashan: "/images/rashan.jpg",
  img_scholarship: "/images/scholarship.jpg",
  img_volunteer: "/images/volunteer.jpg",

  // Email & SMTP Configuration
  smtp_host: "smtp.gmail.com",
  smtp_port: "465",
  smtp_user: "alhamdfoundation2012@gmail.com",
  smtp_pass: "", // Gmail App Password (16 characters)
  smtp_from: "Alhamd Foundation <alhamdfoundation2012@gmail.com>",
  notification_email: "alhamdfoundation2012@gmail.com",
  email_enabled: "false",

  // ===== Email Branding (used in every email header/footer) =====
  email_brand_title: "Alhamd Foundation",
  email_brand_tagline: "Serving Humanity Since 2012",
  email_footer: "Alhamd Foundation • alhamdfoundation2012@gmail.com",

  // ===== Email Templates (fully editable from Admin Panel) =====
  // Available shortcodes:
  // {{name}} {{id}} {{university}} {{semester}} {{city}} {{phone}}
  // {{email}} {{fee}} {{fatherName}} {{cnic}} {{reason}}

  // 1. New application -> Foundation
  tpl_new_admin_enabled: "true",
  tpl_new_admin_subject: "New Scholarship Application #{{id}} — {{name}}",
  tpl_new_admin_body:
    "A new scholarship application has been received.\n\nApplication ID: #{{id}}\nStudent Name: {{name}}\nFather Name: {{fatherName}}\nCNIC / B-Form: {{cnic}}\nPhone: {{phone}}\nEmail: {{email}}\nUniversity: {{university}}\nSemester: {{semester}}\nSemester Fee: Rs. {{fee}}\nCity: {{city}}\n\nPlease review the submitted documents in the Admin Panel.",

  // 2. New application -> Student
  tpl_new_student_enabled: "true",
  tpl_new_student_subject: "Application Received #{{id}} — Alhamd Foundation",
  tpl_new_student_body:
    "Dear {{name}},\n\nYour scholarship application (#{{id}}) has been successfully received by Alhamd Foundation.\n\nStatus: Under Review\nUniversity: {{university}} ({{semester}})\nApplication Fee: Received\n\nOur committee will review your documents and verify the fee voucher. Selection announcements are made every 6 months.\n\nMay Allah grant you success in your studies.\n\nRegards,\nAlhamd Foundation",

  // 3. Application approved
  tpl_approve_enabled: "true",
  tpl_approve_subject: "Congratulations! Application #{{id}} Approved",
  tpl_approve_body:
    "Dear {{name}},\n\nWe are pleased to inform you that your scholarship application (#{{id}}) has been APPROVED by Alhamd Foundation.\n\nUniversity: {{university}} ({{semester}})\n\nOur team will contact you shortly on {{phone}} regarding the next steps.\n\nMay Allah grant you success in your studies.\n\nRegards,\nAlhamd Foundation",

  // 4. Application rejected
  tpl_reject_enabled: "true",
  tpl_reject_subject: "Update on Your Application #{{id}}",
  tpl_reject_body:
    "Dear {{name}},\n\nThank you for applying to the Alhamd Foundation scholarship programme.\n\nAfter careful review, we regret to inform you that your application (#{{id}}) could not be approved at this time.\n\nReason: {{reason}}\n\nWe encourage you to apply again in our next cycle.\n\nRegards,\nAlhamd Foundation",

  // 5. Lucky draw selection
  tpl_lucky_enabled: "true",
  tpl_lucky_subject: "You Have Been Selected — Alhamd Foundation",
  tpl_lucky_body:
    "Dear {{name}},\n\nCongratulations! You have been selected in the Alhamd Foundation lucky draw.\n\nApplication ID: #{{id}}\nCity: {{city}}\n\nOur team will contact you on {{phone}} with further details.\n\nRegards,\nAlhamd Foundation",

  // 6. Withdrawn / cancelled
  tpl_withdraw_enabled: "true",
  tpl_withdraw_subject: "Application #{{id}} Withdrawn",
  tpl_withdraw_body:
    "Dear {{name}},\n\nYour application (#{{id}}) with Alhamd Foundation has been withdrawn / cancelled.\n\nReason: {{reason}}\n\nIf this was a mistake, please contact us at your earliest convenience.\n\nRegards,\nAlhamd Foundation",

  // Admin password (change from admin settings)
  admin_password: "alhamd2012",
};

export type SettingsMap = Record<string, string>;

export async function getAllSettings(): Promise<SettingsMap> {
  const rows = await db.select().from(settings);
  const map: SettingsMap = { ...SETTING_DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
