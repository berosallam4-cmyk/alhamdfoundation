"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPKR, formatPKT } from "@/lib/format";
import { fileToDataUrl } from "@/lib/imageUpload";
import { TEMPLATE_LIST } from "@/lib/emailTemplateList";

/* ---------- Types ---------- */
type Application = { id: number; fullName: string; fatherName: string; cnic: string; phone: string; email: string; university: string; semester: string; perSemesterFee: number; city: string; guardianProfession: string; familyMembers: number; studentPhoto: string; idCardFront: string; idCardBack: string; feeVoucher: string; paymentScreenshot: string; status: string; createdAt: string; };
type Program = { id: number; title: string; slug: string; category: string; description: string; bannerImage: string | null; deadline: string | null; isActive: boolean; showOnHome: boolean; createdAt: string; };
type ProgramApplication = { id: number; programId: number; programSlug: string; fullName: string; fatherName: string; cnic: string; phone: string; email: string | null; city: string; institution: string | null; status: string; notes: string | null; screenshot: string | null; createdAt: string; };
type Donation = { id: number; purpose: string; message: string | null; screenshot: string; createdAt: string; };
type Volunteer = { id: number; fullName: string; fatherName: string; city: string; phone: string; email: string | null; motivation: string; createdAt: string; };
type Review = { id: number; name: string; message: string; createdAt: string };
type RashanItem = { id: number; name: string; quantity: string; price: number };
type Family = { id: number; familyHead: string; city: string; members: number; phone: string | null; notes: string | null; createdAt: string; };

type AdminData = {
  settings: Record<string, string>; applications: Application[]; programs: Program[]; programApplications: ProgramApplication[];
  donations: Donation[]; volunteers: Volunteer[]; reviews: Review[]; rashanItems: RashanItem[]; families: Family[];
};

type ActFn = (action: string, payload?: Record<string, unknown>) => Promise<Record<string, unknown> & { winners?: any[]; newTotal?: number; success?: boolean; message?: string; }>;

const TABS = [
  ["dashboard", "📊", "Dashboard"],
  ["numbers", "🔢", "Public Numbers"],
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

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition";
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

  useEffect(() => { load(); }, [load]);

  const act: ActFn = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    const res = await fetch("/api/admin/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setToast(`❌ ${json.error || "Action failed"}`);
    else { setToast("✅ Changes saved successfully"); await load(); }
    setTimeout(() => setToast(""), 4000);
    return json;
  }, [load]);

  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); router.refresh(); }

  if (!data) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white animate-pulse">AF</div>
      <p className="mt-4 text-sm font-semibold tracking-wide text-slate-300">Loading Alhamd Foundation Admin Panel…</p>
    </div>
  );

  const pendingApps = (data.applications || []).filter((a) => a.status === "pending").length;
  const pendingProgApps = (data.programApplications || []).filter((a) => a.status === "pending").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 lg:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 font-black text-emerald-950 shadow-lg shadow-amber-400/20">AF</div>
            <div>
              <div className="text-base font-extrabold text-white leading-tight">Alhamd Foundation</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Super Admin Panel</span>
              </div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden">☰</button>
        </div>
        <nav className={`flex-col gap-1 p-3 lg:flex ${mobileMenuOpen ? "flex" : "hidden lg:flex"}`}>
          {TABS.map(([key, icon, label]) => (
            <button key={key} onClick={() => { setTab(key); setMobileMenuOpen(false); }} className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${tab === key ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}>
              <span className="flex items-center gap-3"><span className="text-base">{icon}</span><span>{label}</span></span>
              {key === "applications" && pendingApps > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-emerald-950">{pendingApps}</span>}
              {key === "programs" && pendingProgApps > 0 && <span className="rounded-full bg-sky-400 px-2 py-0.5 text-[11px] font-extrabold text-slate-950">{pendingProgApps}</span>}
              {key === "scholarship_control" && data.settings.scholarship_results_published === "true" && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold text-emerald-950 animate-pulse">LIVE</span>}
            </button>
          ))}
          <div className="my-2 border-t border-slate-800/80" />
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"><span>🌐</span><span>View Public Website</span></a>
          <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-left text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"><span>🚪</span><span>Logout</span></button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">Admin Section</span>
            <span className="text-slate-600">/</span>
            <h2 className="text-sm font-bold text-white capitalize">{tab.replace("_", " ")}</h2>
          </div>
        </header>

        {toast && <div className="fixed right-6 top-16 z-50 rounded-xl bg-slate-800 px-5 py-3.5 text-sm font-bold shadow-2xl ring-1 ring-slate-700 animate-slide-down">{toast}</div>}

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {tab === "dashboard" && <Dashboard data={data} setTab={setTab} />}
          {tab === "numbers" && <NumbersTab data={data} act={act} />}
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
   PUBLIC NUMBERS TAB (AUTO + MANUAL)
   ========================================================================= */
function NumbersTab({ data, act }: { data: AdminData; act: ActFn }) {
  const settings = data.settings;
  const [v, setV] = useState<Record<string, string>>({
    stat_scholarships: settings.stat_scholarships || "0",
    stat_families: settings.stat_families || "0",
    stat_years: settings.stat_years || "0",
    founded_year: settings.founded_year || "2012",
  });
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) { setV((p) => ({ ...p, [key]: value })); }
  function bump(key: string, delta: number) { setV((p) => ({ ...p, [key]: String(Math.max(0, (parseInt(p[key]) || 0) + delta)) })); }

  async function save() {
    setSaving(true);
    await act("updateSettings", { settings: v });
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">🔢 Public Numbers (Auto + Manual)</h1>
          <p className="mt-1 text-sm text-slate-400">Yahan se number badlein. Website par har jagah update ho jayega.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-black text-white hover:bg-emerald-500">
          {saving ? "Saving…" : "💾 Save Numbers"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h3 className="font-extrabold text-white">🎓 Scholarships Awarded</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => bump("stat_scholarships", -1)} className="h-11 w-11 rounded-lg bg-slate-800 text-xl font-black text-white hover:bg-slate-700">−</button>
            <input type="number" value={v.stat_scholarships} onChange={(e) => set("stat_scholarships", e.target.value)} className={`${inputCls} text-center text-2xl font-black`} />
            <button onClick={() => bump("stat_scholarships", 1)} className="h-11 w-11 rounded-lg bg-emerald-600 text-xl font-black text-white hover:bg-emerald-500">+</button>
          </div>
          <p className="text-xs text-slate-400">Student select karne par khud +1 hoga.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h3 className="font-extrabold text-white">🛒 Rashan Families</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => bump("stat_families", -1)} className="h-11 w-11 rounded-lg bg-slate-800 text-xl font-black text-white hover:bg-slate-700">−</button>
            <input type="number" value={v.stat_families} onChange={(e) => set("stat_families", e.target.value)} className={`${inputCls} text-center text-2xl font-black`} />
            <button onClick={() => bump("stat_families", 1)} className="h-11 w-11 rounded-lg bg-emerald-600 text-xl font-black text-white hover:bg-emerald-500">+</button>
          </div>
          <p className="text-xs text-slate-400">Family add karne par khud +1 hoga.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="font-extrabold text-white">📅 Foundation Years</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Start Year</label><input value={v.founded_year} onChange={(e) => set("founded_year", e.target.value)} className={inputCls} /></div>
          <div><label className="text-xs font-bold text-slate-400">Total Years of Service</label><input value={v.stat_years} onChange={(e) => set("stat_years", e.target.value)} className={inputCls} /></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ data, setTab }: { data: AdminData; setTab: any }) {
  const pending = (data.applications || []).filter((a) => a.status === "pending").length;
  const rashanTotal = (data.rashanItems || []).reduce((s, i) => s + i.price, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">System Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => setTab("scholarship_control")} className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-left">
          <div className="text-3xl font-black text-amber-400">{data.settings.scholarship_results_published === "true" ? "LIVE" : "OPEN"}</div>
          <div className="mt-1 text-sm font-bold text-white">Scholarship Control</div>
        </button>
        <button onClick={() => setTab("applications")} className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-left">
          <div className="text-3xl font-black text-emerald-400">{pending}</div>
          <div className="mt-1 text-sm font-bold text-white">Pending Applications</div>
        </button>
        <button onClick={() => setTab("programs")} className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5 text-left">
          <div className="text-3xl font-black text-sky-400">{(data.programs || []).length}</div>
          <div className="mt-1 text-sm font-bold text-white">Active Programs</div>
        </button>
        <button onClick={() => setTab("families")} className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5 text-left">
          <div className="text-3xl font-black text-indigo-400">{(data.families || []).length}</div>
          <div className="mt-1 text-sm font-bold text-white">Registered Families</div>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   SCHOLARSHIP CONTROL TAB
   ========================================================================= */
function ScholarshipControlTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState({
    scholarship_countdown_enabled: data.settings.scholarship_countdown_enabled || "true",
    scholarship_deadline: data.settings.scholarship_deadline || "2025-06-30T23:59",
    scholarship_results_published: data.settings.scholarship_results_published || "false",
    scholarship_result_title: data.settings.scholarship_result_title || "Official Scholarship Winners List",
    scholarship_result_message: data.settings.scholarship_result_message || "Mubarak to all selected scholars!",
    scholarship_closed_message: data.settings.scholarship_closed_message || "Registration is closed.",
  });
  const [saving, setSaving] = useState(false);
  const selectedStudents = (data.applications || []).filter((a) => a.status === "selected");

  async function save() { setSaving(true); await act("updateSettings", { settings: s }); setSaving(false); }
  async function togglePublish() {
    const nextState = s.scholarship_results_published === "true" ? "false" : "true";
    if (nextState === "true" && !confirm("Publish the results now?")) return;
    const updated = { ...s, scholarship_results_published: nextState };
    setS(updated);
    await act("updateSettings", { settings: updated });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-black text-white">⏳ Scholarship Countdown & Results</h1>
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 ${s.scholarship_results_published === "true" ? "border-emerald-500/60 bg-emerald-950/40" : "border-amber-500/60 bg-amber-950/40"}`}>
        <h3 className="text-lg font-black text-white">{s.scholarship_results_published === "true" ? "🎉 RESULTS ARE PUBLISHED LIVE" : "⏳ COUNTDOWN PHASE"}</h3>
        <button onClick={togglePublish} className={`shrink-0 rounded-xl px-6 py-3 font-black text-sm transition ${s.scholarship_results_published === "true" ? "bg-red-600 text-white" : "bg-emerald-500 text-emerald-950"}`}>
          {s.scholarship_results_published === "true" ? "🔒 Hide Results" : "📢 PUBLISH RESULTS"}
        </button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Deadline (PKT)</label><input type="datetime-local" value={s.scholarship_deadline} onChange={(e) => setS({ ...s, scholarship_deadline: e.target.value })} className={`${inputCls} mt-1`} /></div>
          <div>
            <label className="text-xs font-bold text-slate-400">Countdown Display</label>
            <select value={s.scholarship_countdown_enabled} onChange={(e) => setS({ ...s, scholarship_countdown_enabled: e.target.value })} className={`${inputCls} mt-1`}><option value="true">Active</option><option value="false">Hidden</option></select>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">Save Settings</button>
      </div>
    </div>
  );
}

/* =========================================================================
   PROGRAMS MANAGER TAB
   ========================================================================= */
function ProgramsTab({ data, act }: { data: AdminData; act: ActFn }) {
  const emptyProg = { title: "", slug: "", category: "general", description: "", bannerImage: "", deadline: "", isActive: true, showOnHome: true };
  const [form, setForm] = useState(emptyProg);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveProg() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editingId) await act("updateProgram", { id: editingId, ...form }); else await act("addProgram", form);
    setForm(emptyProg); setEditingId(null); setSaving(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-white">💻 Programs & Schemes Manager</h1>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base">{editingId ? "Edit" : "Create"} Program</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        <button onClick={saveProg} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">Save Program</button>
      </div>
    </div>
  );
}

/* =========================================================================
   WEBSITE CMS TAB
   ========================================================================= */
function WebsiteCmsTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const val = (k: string) => s[k] ?? "";
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

  async function save() { setSaving(true); await act("updateSettings", { settings: s }); setSaving(false); }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between"><h1 className="text-2xl font-black text-white">📝 Website CMS</h1><button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-black text-white">Save Changes</button></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div><label className="text-xs font-bold text-slate-400">Home Hero Title</label><input value={val("home_hero_title")} onChange={(e) => set("home_hero_title", e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs font-bold text-slate-400">Home Hero Text</label><textarea value={val("home_hero_text")} onChange={(e) => set("home_hero_text", e.target.value)} className={inputCls} /></div>
      </div>
    </div>
  );
}

/* ---------- Applications ---------- */
function Applications({ data, act }: { data: AdminData; act: ActFn }) {
  const [filter, setFilter] = useState("all");
  const apps = filter === "all" ? data.applications || [] : (data.applications || []).filter((a) => a.status === filter);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-white">Scholarship Applications</h1>
      <div className="flex gap-2">
        {["all", "pending", "approved", "selected", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`${btnSm} capitalize ${filter === f ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-3">
        {apps.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex justify-between font-bold text-white"><span>{a.fullName}</span><span>{a.status}</span></div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => act("setApplicationStatus", { id: a.id, status: "selected" })} className={`${btnSm} bg-sky-600 text-white`}>Select for Scholarship</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Draw ---------- */
function Draw({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">🎯 Lucky Draw</h1></div>; }
/* ---------- Donations ---------- */
function Donations({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">💰 Donations</h1></div>; }
/* ---------- Rashan ---------- */
function Rashan({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">🛒 Rashan</h1></div>; }
/* ---------- Families ---------- */
function Families({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">👨‍👩‍👧 Families</h1></div>; }
/* ---------- Volunteers ---------- */
function Volunteers({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">🤝 Volunteers</h1></div>; }
/* ---------- Reviews ---------- */
function Reviews({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">⭐ Reviews</h1></div>; }
/* ---------- Images ---------- */
function ImagesTab({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">🖼️ Images</h1></div>; }
/* ---------- Email ---------- */
function EmailTab({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">✉️ Email Settings</h1></div>; }
/* ---------- Templates ---------- */
function EmailTemplatesTab({ data, act }: { data: AdminData; act: ActFn }) { return <div className="space-y-6"><h1 className="text-2xl font-black text-white">📝 Email Templates</h1></div>; }

/* ---------- Settings ---------- */
function Settings({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState({ ...data.settings, admin_password: "" });
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); await act("updateSettings", { settings: s }); setSaving(false); }
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between"><h1 className="text-2xl font-black text-white">⚙️ Site Settings</h1><button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">Save Settings</button></div>
    </div>
  );
}
