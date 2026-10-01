import { db } from "@/db";
import { settings } from "@/db/schema";

export const SETTING_DEFAULTS: Record<string, string> = {
  stat_families: "104",
  stat_scholarships: "143",
  stat_years: "14",
  founded_year: "2012",
  next_announcement: "Next scholarship announcement: after 6 months",
  application_fee: "300",
  scholarship_note: "Har 6 mahine baad scholarship announcement hoti hai.",
  scholarship_countdown_enabled: "true",
  scholarship_deadline: "2025-06-30T23:59",
  scholarship_results_published: "false",
  scholarship_result_title: "Official Scholarship Winners List",
  scholarship_result_message: "Mubarak to all selected scholars!",
  scholarship_closed_message: "Registration is closed. Results will be announced soon.",
  countdown_heading: "REGISTRATION CLOSES IN",
  countdown_deadline_label: "Deadline:",
  payment_method_type: "JazzCash",
  payment_account_title: "Alhamd Foundation",
  payment_account_number: "0300-0000000",
  payment_bank_name: "Meezan Bank",
  payment_note: "After sending your payment, upload the screenshot below.",
  donate_ayat: "مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ",
  donate_ayat_translation: "The example of those who spend their wealth in the way of Allah is like a seed of grain...",
  donate_ayat_urdu: "جو لوگ اپنا مال اللہ کی راہ میں خرچ کرتے ہیں...",
  home_hero_title: "Serving Humanity Since 2012",
  home_hero_text: "Alhamd Foundation has been working locally for 14 years — providing monthly rashan to 104 families and scholarships to 143 deserving students.",
  home_rashan_card_title: "Monthly Rashan Package",
  home_scholarship_card_title: "University Student Scholarship",
  rashan_intro: "Every month Alhamd Foundation delivers a complete rashan package to deserving families.",
  volunteer_intro: "Young people from any city can join Alhamd Foundation. Joining is completely FREE.",
  contact_email: "alhamdfoundation2012@gmail.com",
  contact_phone: "+92 300 1234567",
  contact_address: "Alhamd Foundation Head Office, Pakistan",
  img_hero: "/images/hero.jpg",
  img_rashan: "/images/rashan.jpg",
  img_scholarship: "/images/scholarship.jpg",
  img_volunteer: "/images/volunteer.jpg",
  smtp_host: "smtp.gmail.com",
  smtp_port: "465",
  smtp_user: "alhamdfoundation2012@gmail.com",
  smtp_pass: "",
  smtp_from: "Alhamd Foundation <alhamdfoundation2012@gmail.com>",
  notification_email: "alhamdfoundation2012@gmail.com",
  email_enabled: "false",
  email_brand_title: "Alhamd Foundation",
  email_brand_tagline: "Serving Humanity Since 2012",
  email_footer: "Alhamd Foundation • alhamdfoundation2012@gmail.com",
  tpl_new_admin_enabled: "true",
  tpl_new_admin_subject: "New Scholarship Application #{{id}} — {{name}}",
  tpl_new_admin_body: "A new scholarship application has been received.\n\nApplication ID: #{{id}}\nStudent Name: {{name}}\nFather Name: {{fatherName}}\nCNIC: {{cnic}}\nPhone: {{phone}}\nEmail: {{email}}\nUniversity: {{university}}\nSemester: {{semester}}\nCity: {{city}}",
  tpl_new_student_enabled: "true",
  tpl_new_student_subject: "Application Received #{{id}} — Alhamd Foundation",
  tpl_new_student_body: "Dear {{name}},\n\nYour scholarship application (#{{id}}) has been received.\n\nStatus: Under Review\nUniversity: {{university}} ({{semester}})\n\nOur team will review your documents.\n\nRegards,\nAlhamd Foundation",
  tpl_approve_enabled: "true",
  tpl_approve_subject: "Congratulations! Application #{{id}} Approved",
  tpl_approve_body: "Dear {{name}},\n\nYour application (#{{id}}) has been APPROVED.\n\nUniversity: {{university}}\n\nRegards,\nAlhamd Foundation",
  tpl_reject_enabled: "true",
  tpl_reject_subject: "Update on Your Application #{{id}}",
  tpl_reject_body: "Dear {{name}},\n\nYour application (#{{id}}) could not be approved at this time.\n\nReason: {{reason}}\n\nRegards,\nAlhamd Foundation",
  tpl_lucky_enabled: "true",
  tpl_lucky_subject: "You Have Been Selected — Alhamd Foundation",
  tpl_lucky_body: "Dear {{name}},\n\nCongratulations! You have been selected.\n\nApplication ID: #{{id}}\n\nRegards,\nAlhamd Foundation",
  tpl_withdraw_enabled: "true",
  tpl_withdraw_subject: "Application #{{id}} Withdrawn",
  tpl_withdraw_body: "Dear {{name}},\n\nYour application (#{{id}}) has been withdrawn.\n\nReason: {{reason}}\n\nRegards,\nAlhamd Foundation",
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
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}
