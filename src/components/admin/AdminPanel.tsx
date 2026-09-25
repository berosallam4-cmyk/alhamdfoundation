"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPKR, formatPKT } from "@/lib/format";
import { fileToDataUrl } from "@/lib/imageUpload";
import { TEMPLATE_LIST } from "@/lib/emailTemplateList";

/* ---------- Types ---------- */
type Application = {
  id: number;
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  email: string;
  university: string;
  semester: string;
  perSemesterFee: number;
  city: string;
  guardianProfession: string;
  familyMembers: number;
  studentPhoto: string;
  idCardFront: string;
  idCardBack: string;
  feeVoucher: string;
  paymentScreenshot: string;
  status: string;
  createdAt: string;
};
type Donation = {
  id: number;
  purpose: string;
  message: string | null;
  screenshot: string;
  createdAt: string;
};
type Volunteer = {
  id: number;
  fullName: string;
  fatherName: string;
  city: string;
  phone: string;
  email: string | null;
  motivation: string;
  createdAt: string;
};
type Review = { id: number; name: string; message: string; createdAt: string };
type RashanItem = { id: number; name: string; quantity: string; price: number };
type Family = {
  id: number;
  familyHead: string;
  city: string;
  members: number;
  phone: string | null;
  notes: string | null;
  createdAt: string;
};
type AdminData = {
  settings: Record<string, string>;
  applications: Application[];
  donations: Donation[];
  volunteers: Volunteer[];
  reviews: Review[];
  rashanItems: RashanItem[];
  families: Family[];
};

type ActFn = (
  action: string,
  payload?: Record<string, unknown>
) => Promise<Record<string, unknown> & {
  winners?: { id: number; fullName: string; fatherName: string; university: string; city: string }[];
  newTotal?: number;
  success?: boolean;
  message?: string;
}>;

const TABS = [
  ["dashboard", "📊", "Dashboard"],
  ["applications", "🎓", "Applications"],
  ["draw", "🎯", "Lucky Draw"],
  ["donations", "💰", "Donations"],
  ["rashan", "🛒", "Rashan Items"],
  ["families", "👨‍👩‍👧", "Families"],
  ["volunteers", "🤝", "Volunteers"],
  ["reviews", "⭐", "Reviews (143+)"],
  ["images", "🖼️", "Website Images"],
  ["email", "✉️", "Email & Notifications"],
  ["templates", "📝", "Email Templates"],
  ["settings", "⚙️", "Site Settings"],
] as const;

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition";
const btnSm = "rounded-lg px-3 py-1.5 text-xs font-bold transition";

export default function AdminPanel() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("dashboard");
  const [toast, setToast] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/data");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act: ActFn = useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(`❌ ${json.error || "Action failed"}`);
      } else {
        setToast("✅ Changes saved successfully");
        await load();
      }
      setTimeout(() => setToast(""), 4000);
      return json;
    },
    [load]
  );

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white shadow-xl animate-pulse">
          AF
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-300">
          Loading Alhamd Foundation Admin Panel…
        </p>
      </div>
    );
  }

  const pendingApps = data.applications.filter((a) => a.status === "pending").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 font-black text-emerald-950 shadow-lg shadow-amber-400/20">
              AF
            </div>
            <div>
              <div className="text-base font-extrabold text-white leading-tight">
                Alhamd Foundation
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Management</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation"
          >
            ☰
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav
          className={`flex-col gap-1 p-3 lg:flex ${
            mobileMenuOpen ? "flex" : "hidden lg:flex"
          }`}
        >
          {TABS.map(([key, icon, label]) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setMobileMenuOpen(false);
                }}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </span>

                {/* Badges */}
                {key === "applications" && pendingApps > 0 && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-emerald-950">
                    {pendingApps}
                  </span>
                )}
                {key === "donations" && data.donations.length > 0 && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400 group-hover:text-slate-200">
                    {data.donations.length}
                  </span>
                )}
                {key === "reviews" && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                    {data.reviews.length}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-2 border-t border-slate-800/80" />

          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <span>🌐</span>
            <span>View Public Website</span>
          </a>

          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-left text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
              Section
            </span>
            <span className="text-slate-600">/</span>
            <h2 className="text-sm font-bold text-white capitalize">
              {tab.replace("_", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 font-medium text-slate-300 border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>alhamdfoundation2012@gmail.com</span>
            </span>
            <a
              href="/"
              target="_blank"
              className="rounded-lg bg-emerald-600/20 px-3 py-1.5 font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition"
            >
              Open Site ↗
            </a>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed right-6 top-16 z-50 rounded-xl bg-slate-800 px-5 py-3.5 text-sm font-bold shadow-2xl ring-1 ring-slate-700 animate-slide-down">
            {toast}
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {tab === "dashboard" && <Dashboard data={data} setTab={setTab} />}
          {tab === "applications" && <Applications data={data} act={act} />}
          {tab === "draw" && <Draw data={data} act={act} />}
          {tab === "donations" && <Donations data={data} act={act} />}
          {tab === "rashan" && <Rashan data={data} act={act} />}
          {tab === "families" && <Families data={data} act={act} />}
          {tab === "volunteers" && <Volunteers data={data} act={act} />}
          {tab === "reviews" && <Reviews data={data} act={act} />}
          {tab === "images" && <ImagesTab data={data} act={act} />}
          {tab === "email" && <EmailTab data={data} act={act} />}
          {tab === "templates" && <EmailTemplatesTab data={data} act={act} />}
          {tab === "settings" && <Settings data={data} act={act} />}
        </main>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({
  data,
  setTab,
}: {
  data: AdminData;
  setTab: (t: (typeof TABS)[number][0]) => void;
}) {
  const pending = data.applications.filter((a) => a.status === "pending").length;
  const approved = data.applications.filter((a) => a.status === "approved").length;
  const selected = data.applications.filter((a) => a.status === "selected").length;
  const rashanTotal = data.rashanItems.reduce((s, i) => s + i.price, 0);

  const cards = [
    {
      title: "Pending Applications",
      count: pending,
      desc: "Waiting for your review",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/30",
      tab: "applications",
    },
    {
      title: "Approved Pool",
      count: approved,
      desc: "Ready for 6-month announcement",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      tab: "applications",
    },
    {
      title: "Selected Beneficiaries",
      count: selected,
      desc: "Awarded scholarships",
      color: "text-sky-400",
      bg: "bg-sky-400/10 border-sky-400/30",
      tab: "applications",
    },
    {
      title: "Donation Proofs",
      count: data.donations.length,
      desc: "Submitted payment screenshots",
      color: "text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/30",
      tab: "donations",
    },
    {
      title: "Rashan Package Cost",
      count: formatPKR(rashanTotal),
      desc: "Auto-calculated per family",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      tab: "rashan",
    },
    {
      title: "Registered Families",
      count: data.families.length,
      desc: "In foundation database",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/30",
      tab: "families",
    },
    {
      title: "Volunteer Registrations",
      count: data.volunteers.length,
      desc: "Free registrations across cities",
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/30",
      tab: "volunteers",
    },
    {
      title: "Community Reviews",
      count: data.reviews.length,
      desc: "Spanning 2012 to 2026",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/30",
      tab: "reviews",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">System Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time summary of Alhamd Foundation operations. All updates here reflect immediately on the public website.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={() => setTab(c.tab as (typeof TABS)[number][0])}
            className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${c.bg}`}
          >
            <div className={`text-3xl font-black tracking-tight ${c.color}`}>
              {c.count}
            </div>
            <div className="mt-1 text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              {c.title}
            </div>
            <div className="mt-1 text-xs text-slate-400">{c.desc}</div>
          </button>
        ))}
      </div>

      {/* Quick Status Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-base font-extrabold text-white">
          Active Website Settings
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-4 text-sm">
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Public Rashan Families</span>
            <span className="text-lg font-bold text-emerald-400">{data.settings.stat_families} Families</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Public Scholarships</span>
            <span className="text-lg font-bold text-amber-300">{data.settings.stat_scholarships} Awarded</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Payment Account</span>
            <span className="text-lg font-bold text-sky-400">{data.settings.payment_method_type || "JazzCash"}</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Email Notification</span>
            <span className="text-xs font-bold text-slate-200 truncate block mt-1">{data.settings.notification_email || "alhamdfoundation2012@gmail.com"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Website Images Tab ---------- */
function ImagesTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [heroImg, setHeroImg] = useState(data.settings.img_hero || "/images/hero.jpg");
  const [rashanImg, setRashanImg] = useState(data.settings.img_rashan || "/images/rashan.jpg");
  const [scholarshipImg, setScholarshipImg] = useState(data.settings.img_scholarship || "/images/scholarship.jpg");
  const [volunteerImg, setVolunteerImg] = useState(data.settings.img_volunteer || "/images/volunteer.jpg");
  const [saving, setSaving] = useState(false);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (s: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file, 1400);
      setter(dataUrl);
    } catch {
      alert("Please upload a valid image file (JPG, PNG).");
    }
  }

  async function saveAllImages() {
    setSaving(true);
    await act("updateSettings", {
      settings: {
        img_hero: heroImg,
        img_rashan: rashanImg,
        img_scholarship: scholarshipImg,
        img_volunteer: volunteerImg,
      },
    });
    setSaving(false);
  }

  const items = [
    {
      title: "1. Hero Background Banner",
      desc: "Displayed at the top of the Home Page.",
      value: heroImg,
      setter: setHeroImg,
      defaultVal: "/images/hero.jpg",
    },
    {
      title: "2. Monthly Rashan Package Image",
      desc: "Displayed on the Home Page Rashan Card & Rashan Program Header.",
      value: rashanImg,
      setter: setRashanImg,
      defaultVal: "/images/rashan.jpg",
    },
    {
      title: "3. University Scholarship Image",
      desc: "Displayed on the Home Page Scholarship Card & Scholarship Page Header.",
      value: scholarshipImg,
      setter: setScholarshipImg,
      defaultVal: "/images/scholarship.jpg",
    },
    {
      title: "4. Volunteer in Allah's Path Image",
      desc: "Displayed on the Home Page Volunteer Card.",
      value: volunteerImg,
      setter: setVolunteerImg,
      defaultVal: "/images/volunteer.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">🖼️ Website Images Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload new photos from your phone or computer. The website updates immediately without broken links.
          </p>
        </div>
        <button
          onClick={saveAllImages}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-extrabold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving Changes…" : "💾 Save All Images"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
          >
            <div>
              <h3 className="font-extrabold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>

            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              <img
                src={item.value}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <label className="cursor-pointer rounded-lg bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition">
                📁 Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, item.setter)}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => item.setter(item.defaultVal)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Reset Default
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Email & Notifications Tab ---------- */
function EmailTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [smtpHost, setSmtpHost] = useState(data.settings.smtp_host || "smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(data.settings.smtp_port || "465");
  const [smtpUser, setSmtpUser] = useState(data.settings.smtp_user || "alhamdfoundation2012@gmail.com");
  const [smtpPass, setSmtpPass] = useState(data.settings.smtp_pass || "");
  const [notificationEmail, setNotificationEmail] = useState(
    data.settings.notification_email || "alhamdfoundation2012@gmail.com"
  );
  const [emailEnabled, setEmailEnabled] = useState(data.settings.email_enabled || "false");
  const [testTo, setTestTo] = useState("alhamdfoundation2012@gmail.com");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function saveEmailSettings() {
    await act("updateSettings", {
      settings: {
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        notification_email: notificationEmail,
        email_enabled: emailEnabled,
      },
    });
  }

  async function sendTest() {
    setTesting(true);
    setTestResult(null);
    const res = await act("testEmail", { to: testTo });
    setTesting(false);
    if (res.success) {
      if (res.simulated) {
        setTestResult("⚠️ Simulation Mode: Passwords not entered yet. Emails are logged safely to server console.");
      } else {
        setTestResult(`✅ Test email delivered successfully to ${testTo}!`);
      }
    } else {
      setTestResult(`❌ Failed to send: ${res.error || "Please check credentials"}`);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">✉️ Email & SMTP Notification Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure automated email alerts for new scholarship applications and student approval confirmations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-white">Live Email Dispatch</h3>
            <p className="text-xs text-slate-400">Send actual emails via Gmail SMTP</p>
          </div>
          <button
            onClick={() => setEmailEnabled(emailEnabled === "true" ? "false" : "true")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              emailEnabled === "true"
                ? "bg-emerald-500 text-emerald-950"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {emailEnabled === "true" ? "ENABLED (Live)" : "SIMULATION (Safe Mode)"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Notification Email (Admin receives new applications here)
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              SMTP Sender Email (Gmail)
            </label>
            <input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Gmail App Password (16 Letters)
            </label>
            <input
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className={`${inputCls} mt-1 font-mono`}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Google App Password (not your personal Gmail login password).
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">SMTP Host</label>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Port</label>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveEmailSettings}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 transition"
        >
          💾 Save Email Settings
        </button>
      </div>

      {/* Test Email Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="font-extrabold text-white">🧪 Send Test Email</h3>
        <p className="text-xs text-slate-400">
          Verify that your emails are arriving safely at alhamdfoundation2012@gmail.com.
        </p>

        <div className="flex gap-3">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            className={`${inputCls} max-w-md`}
            placeholder="Recipient email"
          />
          <button
            onClick={sendTest}
            disabled={testing}
            className="rounded-xl bg-amber-400 px-6 py-2 text-sm font-extrabold text-emerald-950 hover:bg-amber-300 disabled:opacity-50 transition"
          >
            {testing ? "Testing…" : "Send Test"}
          </button>
        </div>

        {testResult && (
          <div className="rounded-xl bg-slate-800/90 border border-slate-700 p-3.5 text-xs font-semibold text-slate-200">
            {testResult}
          </div>
        )}
      </div>

      {/* Help Instructions Card */}
      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-6">
        <h3 className="font-extrabold text-amber-300">
          📖 Gmail App Password Setup (1 Minute Guide)
        </h3>
        <ol className="mt-3 list-decimal list-inside space-y-2 text-xs text-emerald-100 leading-relaxed">
          <li>
            Open your Gmail account: <strong>alhamdfoundation2012@gmail.com</strong>.
          </li>
          <li>
            Go to <strong>Manage Your Google Account → Security</strong>.
          </li>
          <li>
            Ensure <strong>2-Step Verification</strong> is turned ON.
          </li>
          <li>
            Search for <strong>&quot;App passwords&quot;</strong> in the search bar.
          </li>
          <li>
            Create a new app named <strong>&quot;Alhamd Website&quot;</strong> and click Create.
          </li>
          <li>
            Copy the <strong>16-letter code</strong> and paste it into the <em>Gmail App Password</em> field above.
          </li>
        </ol>
      </div>
    </div>
  );
}

/* ---------- Email Templates Tab ---------- */
function EmailTemplatesTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("new_admin");

  const shortcodes = [
    "{{name}}",
    "{{id}}",
    "{{fatherName}}",
    "{{cnic}}",
    "{{phone}}",
    "{{email}}",
    "{{university}}",
    "{{semester}}",
    "{{fee}}",
    "{{city}}",
    "{{reason}}",
  ];

  const val = (k: string) => s[k] ?? "";
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    const payload: Record<string, string> = {
      email_brand_title: val("email_brand_title"),
      email_brand_tagline: val("email_brand_tagline"),
      email_footer: val("email_footer"),
    };
    for (const t of TEMPLATE_LIST) {
      payload[`tpl_${t.key}_enabled`] = val(`tpl_${t.key}_enabled`) || "true";
      payload[`tpl_${t.key}_subject`] = val(`tpl_${t.key}_subject`);
      payload[`tpl_${t.key}_body`] = val(`tpl_${t.key}_body`);
    }
    await act("updateSettings", { settings: payload });
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">📝 Email Templates</h1>
          <p className="mt-1 text-sm text-slate-400">
            Control exactly what each automated email says, and turn any of them ON or OFF.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "💾 Save All Templates"}
        </button>
      </div>

      {/* Shortcode helper */}
      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-5">
        <h3 className="font-extrabold text-amber-300 text-sm">
          Available Shortcodes
        </h3>
        <p className="mt-1 text-xs text-emerald-100/80">
          Paste any of these inside a subject or message — they are automatically replaced with the student&apos;s real details.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {shortcodes.map((c) => (
            <span
              key={c}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 font-mono text-[11px] text-emerald-300"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div>
          <h2 className="font-extrabold text-white text-base">
            Email Branding (header &amp; footer of every email)
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Header Title
            </label>
            <input
              value={val("email_brand_title")}
              onChange={(e) => set("email_brand_title", e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Header Tagline
            </label>
            <input
              value={val("email_brand_tagline")}
              onChange={(e) => set("email_brand_tagline", e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-400">
              Footer Line
            </label>
            <input
              value={val("email_footer")}
              onChange={(e) => set("email_footer", e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </div>
        </div>
      </div>

      {/* Each template */}
      {TEMPLATE_LIST.map((t) => {
        const enabled = (val(`tpl_${t.key}_enabled`) || "true") === "true";
        const isOpen = open === t.key;
        return (
          <div
            key={t.key}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <button
                onClick={() => setOpen(isOpen ? null : t.key)}
                className="flex-1 text-left"
              >
                <div className="font-extrabold text-white">{t.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    set(`tpl_${t.key}_enabled`, enabled ? "false" : "true")
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    enabled
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {enabled ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => setOpen(isOpen ? null : t.key)}
                  className={`${btnSm} bg-slate-800 text-slate-300 border border-slate-700`}
                >
                  {isOpen ? "Close" : "Edit"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-slate-800 bg-slate-950/40 px-5 py-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Subject Line
                  </label>
                  <input
                    value={val(`tpl_${t.key}_subject`)}
                    onChange={(e) => set(`tpl_${t.key}_subject`, e.target.value)}
                    className={`${inputCls} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Message Body
                  </label>
                  <textarea
                    rows={12}
                    value={val(`tpl_${t.key}_body`)}
                    onChange={(e) => set(`tpl_${t.key}_body`, e.target.value)}
                    className={`${inputCls} mt-1 leading-relaxed`}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Leave a blank line between paragraphs. The professional header, styling and footer are added automatically.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60 transition shadow-xl"
      >
        {saving ? "Saving…" : "💾 Save All Templates"}
      </button>
    </div>
  );
}
/* ---------- Reviews Tab (With Edit & Delete) ---------- */
function Reviews({ data, act }: { data: AdminData; act: ActFn }) {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editName, setEditName] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editDate, setEditDate] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit(r: Review) {
    setEditingReview(r);
    setEditName(r.name);
    setEditMessage(r.message);
    // Format date for datetime-local
    const d = new Date(r.createdAt);
    setEditDate(d.toISOString().slice(0, 16));
  }

  async function saveEdit() {
    if (!editingReview) return;
    setSaving(true);
    await act("updateReview", {
      id: editingReview.id,
      name: editName,
      message: editMessage,
      createdAt: editDate ? new Date(editDate).toISOString() : undefined,
    });
    setSaving(false);
    setEditingReview(null);
  }

  const filtered = data.reviews.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Community Reviews ({data.reviews.length})
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Edit or remove any review. Dates range from 2012 to 2026.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search reviews by name or text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} max-w-xs`}
        />
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-lg">
                Edit Review #{editingReview.id}
              </h3>
              <button
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Reviewer Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Review Message</label>
              <textarea
                rows={4}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">
                Posted Date & Time (Pakistan Time)
              </label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveEdit}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.slice(0, 30).map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-white">{r.name}</span>
                <span className="text-xs text-slate-400">
                  🕐 {formatPKT(r.createdAt)} PKT
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{r.message}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(r)}
                className={`${btnSm} bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600 hover:text-white`}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete review from "${r.name}"?`)) {
                    act("deleteReview", { id: r.id });
                  }
                }}
                className={`${btnSm} bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white`}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 30 && (
        <p className="text-center text-xs text-slate-500 pt-2">
          Showing 30 of {filtered.length} reviews. Use search box above to find any specific review.
        </p>
      )}
    </div>
  );
}

/* ---------- Applications ---------- */
function Applications({ data, act }: { data: AdminData; act: ActFn }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const apps =
    filter === "all"
      ? data.applications
      : data.applications.filter((a) => a.status === filter);

  const badge = (s: string) =>
    ({
      pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      approved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
      selected: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    }[s] || "bg-slate-700 text-slate-300");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Scholarship Applications</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review documents. When you Approve or Select, confirmation emails are sent automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "selected", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${btnSm} capitalize ${
              filter === f
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {apps.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No applications found under this filter.
          </p>
        )}
        {apps.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            <button
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-800/50 transition"
            >
              <div>
                <span className="font-extrabold text-white">{a.fullName}</span>
                <span className="ml-2 text-sm text-slate-400">
                  s/o {a.fatherName} — {a.university}, {a.city}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${badge(a.status)}`}>
                  {a.status}
                </span>
                <span className="text-xs text-slate-500">{formatPKT(a.createdAt)}</span>
              </div>
            </button>

            {openId === a.id && (
              <div className="border-t border-slate-800 px-5 py-5 space-y-5 bg-slate-950/40">
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["CNIC / B-Form", a.cnic],
                    ["Active Phone", a.phone],
                    ["Email", a.email],
                    ["University", a.university],
                    ["Current Semester", a.semester],
                    ["Semester Fee", formatPKR(a.perSemesterFee)],
                    ["City", a.city],
                    ["Family Members", String(a.familyMembers ?? 1)],
                    ["Guardian Profession", a.guardianProfession],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <div className="text-[11px] font-bold uppercase text-slate-500">{k}</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Attached Documents (Click to view full size)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[
                      ["Student Photo", a.studentPhoto],
                      ["ID Card Front", a.idCardFront],
                      ["ID Card Back", a.idCardBack],
                      ["Fee Voucher", a.feeVoucher],
                      ["300 PKR Fee Proof", a.paymentScreenshot],
                    ].map(([label, src]) => (
                      <a
                        key={label}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-2 text-center hover:border-emerald-500 transition"
                      >
                        <div className="mb-1 text-[11px] font-bold text-slate-400 group-hover:text-emerald-300">
                          {label}
                        </div>
                        <img
                          src={src}
                          alt={label}
                          className="h-28 w-full rounded-lg object-cover group-hover:opacity-90"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => act("setApplicationStatus", { id: a.id, status: "approved" })}
                    className={`${btnSm} bg-emerald-600 text-white hover:bg-emerald-500`}
                  >
                    ✅ Approve Student (Send Email)
                  </button>
                  <button
                    onClick={() => act("setApplicationStatus", { id: a.id, status: "selected" })}
                    className={`${btnSm} bg-sky-600 text-white hover:bg-sky-500`}
                  >
                    🎉 Select for Scholarship (Send Email)
                  </button>
                  <button
                    onClick={() => act("setApplicationStatus", { id: a.id, status: "rejected" })}
                    className={`${btnSm} bg-red-600/80 text-white hover:bg-red-500`}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => act("setApplicationStatus", { id: a.id, status: "pending" })}
                    className={`${btnSm} bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700`}
                  >
                    ↩ Back to Pending
                  </button>
                  <a
                    href={`mailto:${a.email}?subject=Alhamd Foundation Scholarship — Update on Application %23${a.id}`}
                    className={`${btnSm} bg-amber-400 text-emerald-950 hover:bg-amber-300`}
                  >
                    ✉️ Email Student
                  </a>
                  <button
                    onClick={() => {
                      if (confirm("Delete this application permanently?")) {
                        act("deleteApplication", { id: a.id });
                      }
                    }}
                    className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60 hover:bg-red-950`}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Lucky Draw ---------- */
function Draw({ data, act }: { data: AdminData; act: ActFn }) {
  const approved = data.applications.filter((a) => a.status === "approved");
  const selected = data.applications.filter((a) => a.status === "selected");
  const [count, setCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [winners, setWinners] = useState<
    { id: number; fullName: string; fatherName: string; university: string; city: string }[] | null
  >(null);

  async function run() {
    if (
      !confirm(
        `Run the lucky draw and select ${count} winner(s)? Confirmation emails will be sent and the scholarship counter will increase automatically.`
      )
    )
      return;
    setDrawing(true);
    setWinners(null);
    await new Promise((r) => setTimeout(r, 1200));
    const res = await act("runDraw", { count });
    if (res.winners) setWinners(res.winners);
    setDrawing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🎯 6-Monthly Lucky Draw Selection</h1>
        <p className="mt-1 text-sm text-slate-400">
          Winners are chosen at random from approved applicants. Selected students receive automated confirmation emails.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-3xl font-black text-emerald-400">{approved.length}</div>
          <div className="text-sm font-semibold text-slate-300 mt-1">
            Approved Students in Draw Pool
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-3xl font-black text-amber-300">
            {data.settings.stat_scholarships}
          </div>
          <div className="text-sm font-semibold text-slate-300 mt-1">
            Total Public Scholarship Counter
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <label className="text-sm font-bold text-slate-300">Number of winners to draw</label>
        <div className="flex gap-3">
          <input
            type="number"
            min={1}
            max={Math.max(1, approved.length)}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className={`${inputCls} max-w-[120px]`}
          />
          <button
            onClick={run}
            disabled={drawing || approved.length === 0}
            className="rounded-xl bg-amber-400 px-6 py-2.5 font-extrabold text-emerald-950 hover:bg-amber-300 disabled:opacity-50 shadow transition"
          >
            {drawing ? "🎲 Selecting Winners…" : "🎲 Run Selection Draw"}
          </button>
        </div>

        {approved.length === 0 && (
          <p className="text-sm text-amber-400">
            No approved applications available yet. Review & approve applications first.
          </p>
        )}

        {winners && (
          <div className="mt-4 rounded-xl border border-emerald-700/60 bg-emerald-950/60 p-5">
            <h3 className="text-base font-extrabold text-amber-300">
              🎉 Selected Beneficiaries (Mubarak Ho!):
            </h3>
            <ul className="mt-3 space-y-2">
              {winners.map((w) => (
                <li key={w.id} className="rounded-lg bg-slate-900/80 px-4 py-2.5 text-sm border border-slate-800">
                  <b className="text-white">{w.fullName}</b>
                  <span className="text-slate-400">
                    {" "}
                    s/o {w.fatherName} — {w.university}, {w.city}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-extrabold text-white text-lg">
            All Selected Scholars ({selected.length})
          </h2>
          <div className="space-y-2">
            {selected.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
              >
                <span>
                  <b className="text-white">{a.fullName}</b>{" "}
                  <span className="text-slate-400">
                    — {a.university}, {a.city} • {formatPKR(a.perSemesterFee)}/sem
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-mono">{a.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Donations ---------- */
function Donations({ data, act }: { data: AdminData; act: ActFn }) {
  const label = (p: string) =>
    ({ general: "General Fund", rashan: "Rashan Package", scholarship: "Student Scholarship" }[p] || p);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Donation Proofs ({data.donations.length})</h1>
        <p className="mt-1 text-sm text-slate-400">
          Screenshots submitted by donors through the Donate page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.donations.length === 0 && (
          <p className="col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No donation proofs submitted yet.
          </p>
        )}
        {data.donations.map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                {label(d.purpose)}
              </span>
              <span className="text-xs text-slate-500">{formatPKT(d.createdAt)}</span>
            </div>
            <a href={d.screenshot} target="_blank" rel="noreferrer" className="block">
              <img
                src={d.screenshot}
                alt="Donation screenshot"
                className="h-44 w-full rounded-xl object-cover border border-slate-700 hover:opacity-90 transition"
              />
            </a>
            {d.message && <p className="text-xs italic text-slate-300">“{d.message}”</p>}
            <button
              onClick={() => {
                if (confirm("Delete this donation record?")) act("deleteDonation", { id: d.id });
              }}
              className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60 hover:bg-red-950`}
            >
              🗑 Delete Record
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Rashan Items ---------- */
function Rashan({ data, act }: { data: AdminData; act: ActFn }) {
  const [drafts, setDrafts] = useState<Record<number, RashanItem>>({});
  const [newItem, setNewItem] = useState({ name: "", quantity: "", price: "" });
  const total = useMemo(
    () => data.rashanItems.reduce((s, i) => s + i.price, 0),
    [data.rashanItems]
  );
  const families = parseInt(data.settings.stat_families) || 104;

  const draft = (item: RashanItem) => drafts[item.id] ?? item;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🛒 Monthly Rashan Items & Prices</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update prices anytime. Total package cost auto-calculates on the public website.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-950/40">
            <tr>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Current Price (PKR)</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.rashanItems.map((item) => {
              const d = draft(item);
              const dirty =
                d.name !== item.name || d.quantity !== item.quantity || d.price !== item.price;
              return (
                <tr key={item.id} className="border-b border-slate-800/60">
                  <td className="px-4 py-2.5">
                    <input
                      value={d.name}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [item.id]: { ...d, name: e.target.value } })
                      }
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      value={d.quantity}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [item.id]: { ...d, quantity: e.target.value } })
                      }
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      value={d.price}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [item.id]: { ...d, price: Number(e.target.value) },
                        })
                      }
                      className={`${inputCls} max-w-[130px] font-mono`}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button
                        disabled={!dirty}
                        onClick={async () => {
                          await act("updateRashanItem", {
                            id: item.id,
                            name: d.name,
                            quantity: d.quantity,
                            price: d.price,
                          });
                          setDrafts((prev) => {
                            const cp = { ...prev };
                            delete cp[item.id];
                            return cp;
                          });
                        }}
                        className={`${btnSm} bg-emerald-600 text-white disabled:opacity-30`}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${item.name}"?`))
                            act("deleteRashanItem", { id: item.id });
                        }}
                        className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-3">
                <input
                  placeholder="New item e.g. Ghee"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className={inputCls}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  placeholder="e.g. 2 KG"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className={inputCls}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className={`${inputCls} max-w-[130px] font-mono`}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={!newItem.name || !newItem.quantity || !newItem.price}
                  onClick={async () => {
                    await act("addRashanItem", {
                      name: newItem.name,
                      quantity: newItem.quantity,
                      price: Number(newItem.price),
                    });
                    setNewItem({ name: "", quantity: "", price: "" });
                  }}
                  className={`${btnSm} bg-amber-400 text-emerald-950 font-extrabold disabled:opacity-30`}
                >
                  + Add Item
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5">
          <div className="text-xs uppercase font-bold text-emerald-400">Total Per Family</div>
          <div className="text-3xl font-black text-amber-300 mt-1">{formatPKR(total)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5">
          <div className="text-xs uppercase font-bold text-emerald-400">
            Total for all {families} Families
          </div>
          <div className="text-3xl font-black text-amber-300 mt-1">
            {formatPKR(total * families)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Families ---------- */
function Families({ data, act }: { data: AdminData; act: ActFn }) {
  const empty = { familyHead: "", city: "", members: "1", phone: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const total = data.rashanItems.reduce((s, i) => s + i.price, 0);

  function startEdit(f: Family) {
    setEditId(f.id);
    setForm({
      familyHead: f.familyHead,
      city: f.city,
      members: String(f.members),
      phone: f.phone || "",
      notes: f.notes || "",
    });
  }

  async function save() {
    const payload = {
      familyHead: form.familyHead,
      city: form.city,
      members: Number(form.members),
      phone: form.phone,
      notes: form.notes,
    };
    if (editId) await act("updateFamily", { id: editId, ...payload });
    else await act("addFamily", payload);
    setForm(empty);
    setEditId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          Rashan Beneficiary Families ({data.families.length})
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Monthly allocation cost per family is currently{" "}
          <strong className="text-amber-300">{formatPKR(total)}</strong>.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="font-extrabold text-white text-base">
          {editId ? `Edit Family #${editId}` : "+ Add Beneficiary Family"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            placeholder="Family head name *"
            value={form.familyHead}
            onChange={(e) => setForm({ ...form, familyHead: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="City *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            min="1"
            placeholder="Family members"
            value={form.members}
            onChange={(e) => setForm({ ...form, members: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="Address/Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="flex gap-2">
          <button
            disabled={!form.familyHead || !form.city}
            onClick={save}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-emerald-500 disabled:opacity-30"
          >
            {editId ? "Save Changes" : "+ Add Family"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-950/40">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Family Head</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Monthly Allocation</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.families.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No families added yet.
                </td>
              </tr>
            )}
            {data.families.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-white">
                  {f.familyHead}
                  {f.notes && <div className="text-xs font-normal text-slate-400">{f.notes}</div>}
                </td>
                <td className="px-4 py-3 text-slate-300">{f.city}</td>
                <td className="px-4 py-3 text-slate-300">{f.members}</td>
                <td className="px-4 py-3 text-slate-300">{f.phone || "—"}</td>
                <td className="px-4 py-3 font-bold text-amber-300">{formatPKR(total)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(f)}
                      className={`${btnSm} bg-sky-600 text-white`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove family "${f.familyHead}"?`))
                          act("deleteFamily", { id: f.id });
                      }}
                      className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Volunteers ---------- */
function Volunteers({ data, act }: { data: AdminData; act: ActFn }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">
          Volunteer Registrations ({data.volunteers.length})
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Youth registered from different cities to serve in the path of Allah.
        </p>
      </div>

      <div className="space-y-3">
        {data.volunteers.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No volunteer applications received yet.
          </p>
        )}
        {data.volunteers.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-white text-base">
                {v.fullName}{" "}
                <span className="text-sm font-normal text-slate-400">
                  s/o {v.fatherName} — {v.city}
                </span>
              </span>
              <span className="text-xs text-slate-500">{formatPKT(v.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">“{v.motivation}”</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>📞 {v.phone}</span>
              {v.email && <span>✉️ {v.email}</span>}
              <button
                onClick={() => {
                  if (confirm("Delete this volunteer record?"))
                    act("deleteVolunteer", { id: v.id });
                }}
                className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60 hover:bg-red-950`}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function Settings({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({
    ...data.settings,
    admin_password: "",
  });
  const [saving, setSaving] = useState(false);

  const groups: [string, string, [string, string, boolean?][]][] = [
    [
      "📈 Public Statistics",
      "These numbers appear on the homepage counters. (Scholarship counter auto-increases after each draw).",
      [
        ["stat_families", "Families receiving rashan"],
        ["stat_scholarships", "Total scholarships awarded"],
        ["stat_years", "Years of service"],
        ["founded_year", "Founded year"],
      ],
    ],
    [
      "📅 Scholarship Program Settings",
      "",
      [
        ["next_announcement", "Next announcement text", true],
        ["application_fee", "Application fee (PKR)"],
        ["scholarship_note", "How-it-works description", true],
      ],
    ],
    [
      "💳 Single Official Payment Method",
      "Shown on the Donate page and inside the Scholarship 'See Payment Details' popup.",
      [
        ["payment_method_type", "Payment Method (e.g. JazzCash, EasyPaisa, Bank Transfer)"],
        ["payment_account_title", "Account Title"],
        ["payment_account_number", "Account Number / IBAN"],
        ["payment_bank_name", "Bank Name (if method is Bank Transfer)"],
        ["payment_note", "Payment Note / Instructions", true],
      ],
    ],
    [
      "📝 Page Content & Translations",
      "Edit the text of headers and verses.",
      [
        ["home_hero_title", "Home hero title"],
        ["home_hero_text", "Home hero text", true],
        ["donate_ayat", "Donation page Ayat (Arabic)", true],
        ["donate_ayat_urdu", "Ayat Urdu translation", true],
        ["donate_ayat_translation", "Ayat English translation", true],
        ["rashan_intro", "Rashan page intro", true],
        ["volunteer_intro", "Volunteer page intro", true],
      ],
    ],
    [
      "🔐 Admin Security",
      "Leave blank to keep the current password.",
      [["admin_password", "New admin password"]],
    ],
  ];

  async function save() {
    setSaving(true);
    const payload = { ...s };
    if (!payload.admin_password?.trim()) delete payload.admin_password;
    await act("updateSettings", { settings: payload });
    setS((prev) => ({ ...prev, admin_password: "" }));
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">⚙️ Site Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Changes made here update the public website immediately.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "💾 Save Settings"}
        </button>
      </div>

      {groups.map(([title, hint, fields]) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
        >
          <div>
            <h2 className="font-extrabold text-white text-base">{title}</h2>
            {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label, multiline]) => (
              <div key={key} className={multiline ? "sm:col-span-2" : ""}>
                <label className="text-xs font-bold uppercase text-slate-400">{label}</label>
                {multiline ? (
                  <textarea
                    rows={2}
                    value={s[key] || ""}
                    onChange={(e) => setS({ ...s, [key]: e.target.value })}
                    className={`${inputCls} mt-1`}
                  />
                ) : (
                  <input
                    type={key === "admin_password" ? "password" : "text"}
                    placeholder={key === "admin_password" ? "Leave blank to keep current" : ""}
                    value={s[key] || ""}
                    onChange={(e) => setS({ ...s, [key]: e.target.value })}
                    className={`${inputCls} mt-1`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60 transition shadow-xl"
      >
        {saving ? "Saving…" : "💾 Save All Settings"}
      </button>
    </div>
  );
}
