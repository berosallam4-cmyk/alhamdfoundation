import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Key/value store for site settings, stats, payment details, countdown & page content.
// Editable from the admin panel and reflected instantly on the public site.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  purpose: text("purpose").notNull(), // scholarship | rashan | general
  message: text("message"), // optional message
  screenshot: text("screenshot").notNull(), // base64 data URL of payment screenshot
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const scholarshipApplications = pgTable("scholarship_applications", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  fatherName: text("father_name").notNull(),
  cnic: text("cnic").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  university: text("university").notNull(),
  semester: text("semester").notNull(),
  perSemesterFee: integer("per_semester_fee").notNull(),
  city: text("city").notNull(),
  guardianProfession: text("guardian_profession").notNull(),
  familyMembers: integer("family_members").notNull().default(1),
  studentPhoto: text("student_photo").notNull(), // base64
  idCardFront: text("id_card_front").notNull(), // CNIC/B-Form front (base64)
  idCardBack: text("id_card_back").notNull(), // CNIC/B-Form back (base64)
  feeVoucher: text("fee_voucher").notNull(), // last paid fee voucher (base64)
  paymentScreenshot: text("payment_screenshot").notNull(), // 300 PKR fee proof
  status: text("status").notNull().default("pending"), // pending | approved | rejected | selected
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rashanItems = pgTable("rashan_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(), // e.g. "10 KG"
  price: integer("price").notNull(), // current price in PKR (auto totals)
});

export const rashanFamilies = pgTable("rashan_families", {
  id: serial("id").primaryKey(),
  familyHead: text("family_head").notNull(),
  city: text("city").notNull(),
  members: integer("members").notNull().default(1),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  fatherName: text("father_name").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  motivation: text("motivation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// NAYE PROGRAMS (e.g. Laptop Scheme, IT Courses, etc.)
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // e.g. "Free Laptop Scheme 2025"
  slug: text("slug").notNull().unique(), // e.g. "laptop-scheme"
  category: text("category").notNull().default("general"),
  description: text("description").notNull(),
  bannerImage: text("banner_image"),
  deadline: timestamp("deadline", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  showOnHome: boolean("show_on_home").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Jo log Naye Programs (Laptop Scheme etc) me apply karenge
export const programApplications = pgTable("program_applications", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  programSlug: text("program_slug").notNull(),
  fullName: text("full_name").notNull(),
  fatherName: text("father_name").notNull(),
  cnic: text("cnic").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city").notNull(),
  institution: text("institution"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | selected
  notes: text("notes"),
  screenshot: text("screenshot"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
