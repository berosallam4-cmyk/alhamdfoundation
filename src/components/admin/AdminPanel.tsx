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

type Program = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  bannerImage: string | null;
  deadline: string | null;
  isActive: boolean;
  showOnHome: boolean;
  createdAt: string;
};

type ProgramApplication = {
  id: number;
  programId: number;
  programSlug: string;
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  email: string | null;
  city: string;
  institution: string | null;
  status: string;
  notes: string | null;
  screenshot: string | null;
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
  programs: Program[];
  programApplications: ProgramApplication[];
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
  ["scholarship_control", "⏳", "Scholarship & Countdown"],
  ["programs", "💻", "Programs (Laptop Scheme)"],
  ["website_cms", "📝", "Website Content CMS"],
  ["applications", "🎓", "Scholarship Applications"],
  ["draw", "🎯", "Lucky Draw"],
  ["donations", "💰", "Donations"],
  ["rashan", "🛒", "Rashan Items"],
  ["families", "👨‍👩‍👧", "Families"],
  ["volunteers", "🤝", "Volunteers"],
  ["reviews", "⭐", "Reviews (143+)"],
  ["images", "🖼️", "Website Images"],
  ["email", "✉️", "Email & Alerts"],
  ["templates", "📋", "Email Templates"],
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

  const pendingApps = (data.applications || []).filter((a) => a.status === "pending").length;
  const pendingProgApps = (data.programApplications || []).filter((a) => a.status === "pending").length;

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
                <span>Super Admin Panel</span>
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
                {key === "programs" && pendingProgApps > 0 && (
                  <span className="rounded-full bg-sky-400 px-2 py-0.5 text-[11px] font-extrabold text-slate-950">
                    {pendingProgApps}
                  </span>
                )}
                {key === "scholarship_control" && data.settings.scholarship_results_published === "true" && (
                  <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold text-emerald-950 animate-pulse">
                    LIVE
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
              Admin Section
            </span>
            <span className="text-slate-600">/</span>
            <h2 className="text-sm font-bold text-white capitalize">
              {tab.replace("_", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="/"
              target="_blank"
              className="rounded-lg bg-emerald-600/20 px-3.5 py-1.5 font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition"
            >
              Open Live Site ↗
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
          {tab === "scholarship_control" && <ScholarshipControlTab data={data} act={act} />}
          {tab === "programs" && <ProgramsTab data={data} act={act} />}
          {tab === "website_cms" && <WebsiteCmsTab data={data} act={act} />}
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

/* =========================================================================
   1. SCHOLARSHIP COUNTDOWN & RESULTS CONTROL TAB (Main Feature)
   ========================================================================= */
function ScholarshipControlTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState({
    scholarship_countdown_enabled: data.settings.scholarship_countdown_enabled || "true",
    scholarship_deadline: data.settings.scholarship_deadline || "2025-06-30T23:59",
    scholarship_results_published: data.settings.scholarship_results_published || "false",
    scholarship_result_title: data.settings.scholarship_result_title || "Official Scholarship Winners List",
    scholarship_result_message: data.settings.scholarship_result_message || "Mubarak to all selected scholars! Our team will contact your university for fee transfer.",
    scholarship_closed_message: data.settings.scholarship_closed_message || "Scholarship registration is now closed. Result announcement will be made shortly.",
  });
  const [saving, setSaving] = useState(false);

  const selectedStudents = (data.applications || []).filter((a) => a.status === "selected");

  async function save() {
    setSaving(true);
    await act("updateSettings", { settings: s });
    setSaving(false);
  }

  async function togglePublish() {
    const nextState = s.scholarship_results_published === "true" ? "false" : "true";
    if (nextState === "true") {
      if (!confirm(`Are you sure you want to PUBLISH the results now? All ${selectedStudents.length} selected students will be visible on the public website.`)) {
        return;
      }
    }
    const updated = { ...s, scholarship_results_published: nextState };
    setS(updated);
    await act("updateSettings", { settings: updated });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white">⏳ Scholarship Countdown & Results Controller</h1>
        <p className="mt-1 text-sm text-slate-400">
          Set the application deadline timer. When you are ready, click <b>Publish Results</b> to show the selected winners on the public website.
        </p>
      </div>

      {/* Big Status Banner */}
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
        s.scholarship_results_published === "true"
          ? "border-emerald-500/60 bg-emerald-950/40"
          : "border-amber-500/60 bg-amber-950/40"
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${s.scholarship_results_published === "true" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <h3 className="text-lg font-black text-white">
              Public Status: {s.scholarship_results_published === "true" ? "🎉 RESULTS ARE CURRENTLY PUBLISHED LIVE" : "⏳ REGISTRATION / COUNTDOWN PHASE"}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {s.scholarship_results_published === "true"
              ? `The public website is displaying the official list of ${selectedStudents.length} selected students.`
              : "Results are currently hidden. The website shows the application form and the live countdown."}
          </p>
        </div>

        <button
          onClick={togglePublish}
          className={`shrink-0 rounded-xl px-6 py-3 font-black text-sm shadow-xl transition ${
            s.scholarship_results_published === "true"
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950"
          }`}
        >
          {s.scholarship_results_published === "true" ? "🔒 Hide / Unpublish Results" : "📢 PUBLISH RESULTS NOW"}
        </button>
      </div>

      {/* Timer & Settings Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <h3 className="font-extrabold text-white text-base">⏰ Deadline & Countdown Configuration</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Registration Deadline (Date & Time PKT)
            </label>
            <input
              type="datetime-local"
              value={s.scholarship_deadline}
              onChange={(e) => setS({ ...s, scholarship_deadline: e.target.value })}
              className={`${inputCls} mt-1`}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              The public countdown will tick towards this exact time.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Live Countdown Display
            </label>
            <select
              value={s.scholarship_countdown_enabled}
              onChange={(e) => setS({ ...s, scholarship_countdown_enabled: e.target.value })}
              className={`${inputCls} mt-1`}
            >
              <option value="true">Active (Show Live Countdown Banner)</option>
              <option value="false">Disabled (Hide Countdown)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-400">
              Closed Registration Message (Shown when deadline passes but results aren&apos;t published yet)
            </label>
            <textarea
              rows={2}
              value={s.scholarship_closed_message}
              onChange={(e) => setS({ ...s, scholarship_closed_message: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Result Announcement Heading
            </label>
            <input
              value={s.scholarship_result_title}
              onChange={(e) => setS({ ...s, scholarship_result_title: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">
              Result Message / Mubarak Note
            </label>
            <input
              value={s.scholarship_result_message}
              onChange={(e) => setS({ ...s, scholarship_result_message: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "💾 Save Countdown & Settings"}
        </button>
      </div>

      {/* Selected Candidates Preview Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">
              🎓 Selected Scholarship Winners Pool ({selectedStudents.length})
            </h3>
            <p className="text-xs text-slate-400">
              These students will be shown to the public when Results are published.
            </p>
          </div>
        </div>

        {selectedStudents.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500 text-sm">
            No students have been marked as &apos;selected&apos; yet. Go to <b>Scholarship Applications</b> or <b>Lucky Draw</b> tab to select students.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Father Name</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Fee / Semester</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudents.map((st, i) => (
                  <tr key={st.id} className="border-b border-slate-800/60">
                    <td className="px-4 py-3 text-slate-500 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{st.fullName}</td>
                    <td className="px-4 py-3 text-slate-300">{st.fatherName}</td>
                    <td className="px-4 py-3 text-slate-300">{st.university}</td>
                    <td className="px-4 py-3 text-slate-300">{st.city}</td>
                    <td className="px-4 py-3 text-amber-300 font-bold">{formatPKR(st.perSemesterFee)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => act("setApplicationStatus", { id: st.id, status: "approved" })}
                        className={`${btnSm} bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700`}
                        title="Remove from selected list and move back to approved"
                      >
                        Remove from Winner List
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   2. PROGRAMS MANAGER TAB (Laptop Scheme, IT Courses, etc.)
   ========================================================================= */
function ProgramsTab({ data, act }: { data: AdminData; act: ActFn }) {
  const emptyProg = {
    title: "",
    slug: "",
    category: "general",
    description: "",
    bannerImage: "",
    deadline: "",
    isActive: true,
    showOnHome: true,
  };
  const [form, setForm] = useState(emptyProg);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProgId, setSelectedProgId] = useState<number | "all">("all");
  const [saving, setSaving] = useState(false);

  const programsList = data.programs || [];
  const progApps = data.programApplications || [];

  function startEdit(p: Program) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.description,
      bannerImage: p.bannerImage || "",
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 16) : "",
      isActive: p.isActive,
      showOnHome: p.showOnHome,
    });
  }

  async function saveProg() {
    if (!form.title.trim()) return alert("Program title is required");
    setSaving(true);
    if (editingId) {
      await act("updateProgram", { id: editingId, ...form });
    } else {
      await act("addProgram", form);
    }
    setForm(emptyProg);
    setEditingId(null);
    setSaving(false);
  }

  const filteredApps =
    selectedProgId === "all"
      ? progApps
      : progApps.filter((a) => a.programId === selectedProgId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">💻 Programs & Schemes Manager</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create new schemes (like <b>Free Laptop Scheme</b>, <b>Vocational Training</b>, <b>Rashan Drives</b>) and manage applications.
        </p>
      </div>

      {/* Program Create/Edit Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base">
          {editingId ? `✏️ Edit Program #${editingId}` : "+ Create New Program (e.g. Laptop Scheme 2025)"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Program Title *</label>
            <input
              placeholder="e.g. Free Laptop Scheme 2025"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">URL Slug (unique)</label>
            <input
              placeholder="e.g. laptop-scheme"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`${inputCls} mt-1`}
            >
              <option value="education">Education / Tech</option>
              <option value="rashan">Rashan & Food</option>
              <option value="welfare">General Welfare</option>
              <option value="skills">Skill Training</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="text-xs font-bold uppercase text-slate-400">Program Details / Description</label>
            <textarea
              rows={3}
              placeholder="Describe eligibility criteria, benefits, and how to apply..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Banner Image URL</label>
            <input
              placeholder="https://... or /images/laptop.jpg"
              value={form.bannerImage}
              onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Last Date to Apply (Optional)</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded accent-emerald-500"
              />
              Active Program (Accepting Applications)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={form.showOnHome}
                onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                className="h-4 w-4 rounded accent-emerald-500"
              />
              Show Card on Home Page
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={saveProg}
            disabled={saving || !form.title}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {saving ? "Saving…" : editingId ? "Save Changes" : "+ Launch Program"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyProg);
              }}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Active Programs List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-white text-lg">Active Schemes & Programs ({programsList.length})</h3>

        {programsList.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No custom programs created yet. Create your first one (e.g. &apos;Laptop Scheme&apos;) using the form above!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {programsList.map((p) => {
              const appCount = progApps.filter((a) => a.programId === p.id).length;
              return (
                <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 capitalize">
                      {p.category}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.isActive ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                      {p.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-base">{p.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{p.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>👥 <b>{appCount}</b> Applications</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className={`${btnSm} bg-sky-600/20 text-sky-300 hover:bg-sky-600 hover:text-white`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete program "${p.title}"?`)) act("deleteProgram", { id: p.id });
                        }}
                        className={`${btnSm} bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Program Applications Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-white text-lg">
              📋 Scheme Applicants List ({filteredApps.length})
            </h3>
            <p className="text-xs text-slate-400">
              Applications submitted for Laptop schemes and other programs.
            </p>
          </div>

          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value === "all" ? "all" : Number(e.target.value))}
            className={`${inputCls} max-w-xs`}
          >
            <option value="all">All Programs</option>
            {programsList.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {filteredApps.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500 text-sm">
            No applications received for this program yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-white">
                    {a.fullName} <span className="text-xs font-normal text-slate-400">s/o {a.fatherName}</span>
                  </span>
                  <span className="text-xs rounded px-2.5 py-0.5 font-bold uppercase bg-slate-800 text-amber-300">
                    {a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                  <div><b>CNIC:</b> {a.cnic}</div>
                  <div><b>Phone:</b> {a.phone}</div>
                  <div><b>City:</b> {a.city}</div>
                  <div><b>Institute:</b> {a.institution || "—"}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => act("setProgramAppStatus", { id: a.id, status: "selected" })}
                    className={`${btnSm} bg-sky-600 text-white`}
                  >
                    Select Beneficiary
                  </button>
                  <button
                    onClick={() => act("setProgramAppStatus", { id: a.id, status: "approved" })}
                    className={`${btnSm} bg-emerald-600 text-white`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => act("setProgramAppStatus", { id: a.id, status: "rejected" })}
                    className={`${btnSm} bg-red-600/60 text-white`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete applicant?")) act("deleteProgramApp", { id: a.id });
                    }}
                    className={`${btnSm} bg-slate-800 text-red-400 ml-auto`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   3. FULL WEBSITE CONTENT CMS (Edit Any Text on the Site)
   ========================================================================= */
function WebsiteCmsTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"home" | "scholarship" | "rashan" | "contact">("home");

  const val = (k: string) => s[k] ?? "";
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    await act("updateSettings", { settings: s });
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">📝 Website Content Editor (CMS)</h1>
          <p className="mt-1 text-sm text-slate-400">
            Edit any text, tagline, Urdu verses, or headings across your website instantly.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-black text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-lg"
        >
          {saving ? "Saving…" : "💾 Save Website Changes"}
        </button>
      </div>

      {/* Page Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          ["home", "🏠 Home Page Content"],
          ["scholarship", "🎓 Scholarship Page Text"],
          ["rashan", "🛒 Rashan Page Text"],
          ["contact", "📞 Footer & Contact Details"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveSection(k as typeof activeSection)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSection === k
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* HOME PAGE SECTION */}
      {activeSection === "home" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">🏠 Home Page Hero & Sections</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-slate-400">Main Top Banner Heading (Hero Title)</label>
              <input
                value={val("home_hero_title")}
                placeholder="Serving Deserving Humanity with Dignity & Transparency"
                onChange={(e) => set("home_hero_title", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-slate-400">Main Banner Sub-Text / Mission Line</label>
              <textarea
                rows={3}
                value={val("home_hero_text")}
                placeholder="Providing monthly rashan packages to 104+ families and merit-cum-need scholarships to university students across Pakistan since 2012."
                onChange={(e) => set("home_hero_text", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Rashan Card Title</label>
              <input
                value={val("home_rashan_card_title") || "Monthly Rashan Package"}
                onChange={(e) => set("home_rashan_card_title", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Scholarship Card Title</label>
              <input
                value={val("home_scholarship_card_title") || "University Student Scholarship"}
                onChange={(e) => set("home_scholarship_card_title", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>
      )}

      {/* SCHOLARSHIP SECTION */}
      {activeSection === "scholarship" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">🎓 Scholarship Page Headings & Notes</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Application Fee (PKR)</label>
              <input
                value={val("application_fee") || "300"}
                onChange={(e) => set("application_fee", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Next Announcement Notice</label>
              <input
                value={val("next_announcement")}
                placeholder="Every 6 months / 30 June"
                onChange={(e) => set("next_announcement", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-slate-400">Scholarship Eligibility & Guidelines Note</label>
              <textarea
                rows={4}
                value={val("scholarship_note")}
                onChange={(e) => set("scholarship_note", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>
      )}

      {/* RASHAN SECTION */}
      {activeSection === "rashan" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">🛒 Rashan Program Description & Ayat</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Rashan Intro Paragraph</label>
              <textarea
                rows={3}
                value={val("rashan_intro")}
                onChange={(e) => set("rashan_intro", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Quran Ayat (Arabic)</label>
              <textarea
                rows={2}
                value={val("donate_ayat")}
                onChange={(e) => set("donate_ayat", e.target.value)}
                className={`${inputCls} mt-1 text-right font-serif text-lg`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Ayat Urdu Translation</label>
              <textarea
                rows={2}
                value={val("donate_ayat_urdu")}
                onChange={(e) => set("donate_ayat_urdu", e.target.value)}
                className={`${inputCls} mt-1 text-right`}
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTACT & FOOTER */}
      {activeSection === "contact" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">📞 Official Contact, WhatsApp & Location</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Official Foundation Email</label>
              <input
                value={val("contact_email") || "alhamdfoundation2012@gmail.com"}
                onChange={(e) => set("contact_email", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">WhatsApp / Helpline Number</label>
              <input
                value={val("contact_phone") || "+92 300 1234567"}
                onChange={(e) => set("contact_phone", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-slate-400">Official Office Address</label>
              <input
                value={val("contact_address") || "Alhamd Foundation Head Office, Pakistan"}
                onChange={(e) => set("contact_address", e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60 transition shadow-xl"
      >
        {saving ? "Saving Changes…" : "💾 Save All Changes to Live Website"}
      </button>
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
  const pending = (data.applications || []).filter((a) => a.status === "pending").length;
  const approved = (data.applications || []).filter((a) => a.status === "approved").length;
  const selected = (data.applications || []).filter((a) => a.status === "selected").length;
  const rashanTotal = (data.rashanItems || []).reduce((s, i) => s + i.price, 0);

  const cards = [
    {
      title: "Scholarship Control",
      count: data.settings.scholarship_results_published === "true" ? "LIVE" : "OPEN",
      desc: "Countdown & Result Announcement",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/30",
      tab: "scholarship_control",
    },
    {
      title: "Active Programs",
      count: (data.programs || []).length,
      desc: "Laptop Scheme & other drives",
      color: "text-sky-400",
      bg: "bg-sky-400/10 border-sky-400/30",
      tab: "programs",
    },
    {
      title: "Pending Applications",
      count: pending,
      desc: "Scholarship applicant reviews",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/30",
      tab: "applications",
    },
    {
      title: "Selected Beneficiaries",
      count: selected,
      desc: "Awarded scholarships",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      tab: "applications",
    },
    {
      title: "Donation Proofs",
      count: (data.donations || []).length,
      desc: "Submitted payment receipts",
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
      count: (data.families || []).length,
      desc: "In rashan directory",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/30",
      tab: "families",
    },
    {
      title: "Community Reviews",
      count: (data.reviews || []).length,
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
            <span className="text-lg font-bold text-emerald-400">{data.settings.stat_families || 104} Families</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Public Scholarships</span>
            <span className="text-lg font-bold text-amber-300">{data.settings.stat_scholarships || 143} Awarded</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Payment Account</span>
            <span className="text-lg font-bold text-sky-400">{data.settings.payment_method_type || "JazzCash"}</span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <span className="text-xs text-slate-400 block font-medium">Result Announcement Status</span>
            <span className="text-xs font-bold text-slate-200 truncate block mt-1">
              {data.settings.scholarship_results_published === "true" ? "🎉 PUBLISHED LIVE" : "⏳ Countdown Running"}
            </span>
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
            Upload new photos from your phone or computer. The website updates immediately.
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
    </div>
  );
}

/* ---------- Email Templates Tab ---------- */
function EmailTemplatesTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("new_admin");

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

      {TEMPLATE_LIST.map((t) => {
        const enabled = (val(`tpl_${t.key}_enabled`) || "true") === "true";
        const isOpen = open === t.key;
        return (
          <div key={t.key} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <button onClick={() => setOpen(isOpen ? null : t.key)} className="flex-1 text-left">
                <div className="font-extrabold text-white">{t.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => set(`tpl_${t.key}_enabled`, enabled ? "false" : "true")}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    enabled ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-400 border border-slate-700"
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
                  <label className="text-xs font-bold uppercase text-slate-400">Subject Line</label>
                  <input
                    value={val(`tpl_${t.key}_subject`)}
                    onChange={(e) => set(`tpl_${t.key}_subject`, e.target.value)}
                    className={`${inputCls} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Message Body</label>
                  <textarea
                    rows={10}
                    value={val(`tpl_${t.key}_body`)}
                    onChange={(e) => set(`tpl_${t.key}_body`, e.target.value)}
                    className={`${inputCls} mt-1 leading-relaxed`}
                  />
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

/* ---------- Reviews Tab ---------- */
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

  const filtered = (data.reviews || []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Community Reviews ({filtered.length})
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Edit or remove any review. Dates range from 2012 to 2026.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search reviews..."
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
              <button onClick={() => setEditingReview(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Reviewer Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`${inputCls} mt-1`} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Review Message</label>
              <textarea rows={4} value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className={`${inputCls} mt-1`} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Posted Date & Time</label>
              <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={`${inputCls} mt-1`} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingReview(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300">
                Cancel
              </button>
              <button disabled={saving} onClick={saveEdit} className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.slice(0, 30).map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-white">{r.name}</span>
                <span className="text-xs text-slate-400">🕐 {formatPKT(r.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{r.message}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(r)} className={`${btnSm} bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600 hover:text-white`}>
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete review from "${r.name}"?`)) act("deleteReview", { id: r.id });
                }}
                className={`${btnSm} bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white`}
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

/* ---------- Applications ---------- */
function Applications({ data, act }: { data: AdminData; act: ActFn }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const apps =
    filter === "all"
      ? data.applications || []
      : (data.applications || []).filter((a) => a.status === filter);

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
              filter === f ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
          <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
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
                        <img src={src} alt={label} className="h-28 w-full rounded-lg object-cover group-hover:opacity-90" />
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
                  <button
                    onClick={() => {
                      if (confirm("Delete this application permanently?")) act("deleteApplication", { id: a.id });
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
  const approved = (data.applications || []).filter((a) => a.status === "approved");
  const selected = (data.applications || []).filter((a) => a.status === "selected");
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
          <div className="text-sm font-semibold text-slate-300 mt-1">Approved Students in Draw Pool</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-3xl font-black text-amber-300">{data.settings.stat_scholarships || 143}</div>
          <div className="text-sm font-semibold text-slate-300 mt-1">Total Public Scholarship Counter</div>
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

        {winners && (
          <div className="mt-4 rounded-xl border border-emerald-700/60 bg-emerald-950/60 p-5">
            <h3 className="text-base font-extrabold text-amber-300">🎉 Selected Beneficiaries:</h3>
            <ul className="mt-3 space-y-2">
              {winners.map((w) => (
                <li key={w.id} className="rounded-lg bg-slate-900/80 px-4 py-2.5 text-sm border border-slate-800">
                  <b className="text-white">{w.fullName}</b>
                  <span className="text-slate-400"> s/o {w.fatherName} — {w.university}, {w.city}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Donations ---------- */
function Donations({ data, act }: { data: AdminData; act: ActFn }) {
  const dons = data.donations || [];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Donation Proofs ({dons.length})</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dons.length === 0 && (
          <p className="col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No donation proofs submitted yet.
          </p>
        )}
        {dons.map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                {d.purpose}
              </span>
              <span className="text-xs text-slate-500">{formatPKT(d.createdAt)}</span>
            </div>
            <a href={d.screenshot} target="_blank" rel="noreferrer" className="block">
              <img src={d.screenshot} alt="Donation" className="h-44 w-full rounded-xl object-cover border border-slate-700 hover:opacity-90 transition" />
            </a>
            {d.message && <p className="text-xs italic text-slate-300">“{d.message}”</p>}
            <button
              onClick={() => {
                if (confirm("Delete donation proof?")) act("deleteDonation", { id: d.id });
              }}
              className={`${btnSm} bg-slate-800 text-red-400 border border-red-900/60`}
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
  const items = data.rashanItems || [];
  const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
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
            {items.map((item) => {
              const d = draft(item);
              const dirty = d.name !== item.name || d.quantity !== item.quantity || d.price !== item.price;
              return (
                <tr key={item.id} className="border-b border-slate-800/60">
                  <td className="px-4 py-2.5">
                    <input
                      value={d.name}
                      onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, name: e.target.value } })}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      value={d.quantity}
                      onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, quantity: e.target.value } })}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      value={d.price}
                      onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, price: Number(e.target.value) } })}
                      className={`${inputCls} max-w-[130px] font-mono`}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button
                        disabled={!dirty}
                        onClick={async () => {
                          await act("updateRashanItem", { id: item.id, name: d.name, quantity: d.quantity, price: d.price });
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
                          if (confirm(`Remove "${item.name}"?`)) act("deleteRashanItem", { id: item.id });
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
                <input placeholder="New item" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} />
              </td>
              <td className="px-4 py-3">
                <input placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className={inputCls} />
              </td>
              <td className="px-4 py-3">
                <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className={`${inputCls} max-w-[130px]`} />
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={!newItem.name || !newItem.quantity || !newItem.price}
                  onClick={async () => {
                    await act("addRashanItem", { name: newItem.name, quantity: newItem.quantity, price: Number(newItem.price) });
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
          <div className="text-xs uppercase font-bold text-emerald-400">Total for all {families} Families</div>
          <div className="text-3xl font-black text-amber-300 mt-1">{formatPKR(total * families)}</div>
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
  const families = data.families || [];

  function startEdit(f: Family) {
    setEditId(f.id);
    setForm({ familyHead: f.familyHead, city: f.city, members: String(f.members), phone: f.phone || "", notes: f.notes || "" });
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
        <h1 className="text-2xl font-black text-white">Rashan Beneficiary Families ({families.length})</h1>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="font-extrabold text-white text-base">{editId ? `Edit Family #${editId}` : "+ Add Beneficiary Family"}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input placeholder="Family head name *" value={form.familyHead} onChange={(e) => setForm({ ...form, familyHead: e.target.value })} className={inputCls} />
          <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
          <input type="number" min="1" placeholder="Members" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} className={inputCls} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
        </div>
        <button disabled={!form.familyHead || !form.city} onClick={save} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-extrabold text-white">
          {editId ? "Save Changes" : "+ Add Family"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-950/40">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Family Head</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-white">{f.familyHead}</td>
                <td className="px-4 py-3 text-slate-300">{f.city}</td>
                <td className="px-4 py-3 text-slate-300">{f.members}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(f)} className={`${btnSm} bg-sky-600 text-white`}>Edit</button>
                    <button onClick={() => { if (confirm("Delete family?")) act("deleteFamily", { id: f.id }); }} className={`${btnSm} bg-slate-800 text-red-400`}>Delete</button>
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
  const vols = data.volunteers || [];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Volunteer Registrations ({vols.length})</h1>
      </div>
      <div className="space-y-3">
        {vols.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
            <div className="flex justify-between">
              <span className="font-extrabold text-white">{v.fullName} <span className="text-xs text-slate-400">s/o {v.fatherName} — {v.city}</span></span>
              <span className="text-xs text-slate-500">{formatPKT(v.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300">“{v.motivation}”</p>
            <div className="flex gap-4 text-xs text-slate-400 pt-1">
              <span>📞 {v.phone}</span>
              {v.email && <span>✉️ {v.email}</span>}
              <button onClick={() => { if (confirm("Delete volunteer?")) act("deleteVolunteer", { id: v.id }); }} className={`${btnSm} bg-slate-800 text-red-400 ml-auto`}>Delete</button>
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
          <h1 className="text-2xl font-black text-white">⚙️ Site Settings & Security</h1>
        </div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500">
          {saving ? "Saving…" : "💾 Save Settings"}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">💳 Official Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Payment Method (JazzCash / EasyPaisa / Bank)</label>
            <input value={s.payment_method_type || ""} onChange={(e) => setS({ ...s, payment_method_type: e.target.value })} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Account Title</label>
            <input value={s.payment_account_title || ""} onChange={(e) => setS({ ...s, payment_account_title: e.target.value })} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Account Number / IBAN</label>
            <input value={s.payment_account_number || ""} onChange={(e) => setS({ ...s, payment_account_number: e.target.value })} className={`${inputCls} mt-1 font-mono`} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Bank Name (if applicable)</label>
            <input value={s.payment_bank_name || ""} onChange={(e) => setS({ ...s, payment_bank_name: e.target.value })} className={`${inputCls} mt-1`} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🔐 Change Admin Password</h2>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">New Admin Password (leave blank to keep current)</label>
          <input type="password" placeholder="Min 6 characters" value={s.admin_password || ""} onChange={(e) => setS({ ...s, admin_password: e.target.value })} className={`${inputCls} mt-1`} />
        </div>
      </div>
    </div>
  );
}
