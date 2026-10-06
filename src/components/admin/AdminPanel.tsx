"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPKR, formatPKT } from "@/lib/format";
import { fileToDataUrl } from "@/lib/imageUpload";
import { TEMPLATE_LIST } from "@/lib/emailTemplateList";
import PageTextsTab from "./PageTextsTab";

/* ---------- Types ---------- */
type Application = { id: number; fullName: string; fatherName: string; cnic: string; phone: string; email: string; university: string; semester: string; perSemesterFee: number; city: string; guardianProfession: string; familyMembers: number; studentPhoto: string; idCardFront: string; idCardBack: string; feeVoucher: string; paymentScreenshot: string; status: string; createdAt: string; };
type Donation = { id: number; purpose: string; message: string | null; screenshot: string; createdAt: string; };
type Volunteer = { id: number; fullName: string; fatherName: string; city: string; phone: string; email: string | null; motivation: string; createdAt: string; };
type Review = { id: number; name: string; message: string; createdAt: string; };
type RashanItem = { id: number; name: string; quantity: string; price: number; };
type Family = { id: number; familyHead: string; city: string; members: number; phone: string | null; notes: string | null; createdAt: string; };

type AdminData = {
  settings: Record<string, string>;
  applications: Application[];
  donations: Donation[];
  volunteers: Volunteer[];
  reviews: Review[];
  rashanItems: RashanItem[];
  families: Family[];
};

type ActFn = (action: string, payload?: Record<string, unknown>) => Promise<Record<string, unknown> & { winners?: { id: number; fullName: string; fatherName: string; university: string; city: string }[]; newTotal?: number; success?: boolean; error?: string; simulated?: boolean; }>;

const TABS = [
  ["dashboard", "📊", "Dashboard"],
  ["scholarship_control", "⏳", "Scholarship & Countdown"],
  ["applications", "🎓", "Scholarship Applications"],
  ["draw", "🎯", "Lucky Draw"],
  ["donations", "💰", "Donations"],
  ["rashan", "🛒", "Rashan Items"],
  ["families", "👨‍👩‍👧", "Families"],
  ["volunteers", "🤝", "Volunteers"],
  ["reviews", "⭐", "Reviews"],
  ["images", "🖼️", "Website Images"],
  ["email", "✉️", "Email & Alerts"],
  ["templates", "📋", "Email Templates"],
  ["settings", "⚙️", "Site Settings"],
    ["pagetexts", "📝", "Page Texts & Forms"],
] as const;

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition";
const btnSm = "rounded-lg px-3 py-1.5 text-xs font-bold transition";

/* ========================================================================= */
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
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden">☰</button>
        </div>
        <nav className={`flex-col gap-1 p-3 lg:flex ${mobileMenuOpen ? "flex" : "hidden lg:flex"}`}>
          {TABS.map(([key, icon, label]) => (
            <button key={key} onClick={() => { setTab(key); setMobileMenuOpen(false); }} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${tab === key ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}>
              <span className="flex items-center gap-3"><span className="text-base">{icon}</span><span>{label}</span></span>
              {key === "applications" && pendingApps > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-emerald-950">{pendingApps}</span>}
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
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">Admin</span>
            <span className="text-slate-600">/</span>
            <h2 className="text-sm font-bold text-white capitalize">{tab.replace("_", " ")}</h2>
          </div>
          <a href="/" target="_blank" className="rounded-lg bg-emerald-600/20 px-3.5 py-1.5 font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition">Open Site ↗</a>
        </header>

        {toast && <div className="fixed right-6 top-16 z-50 rounded-xl bg-slate-800 px-5 py-3.5 text-sm font-bold shadow-2xl ring-1 ring-slate-700 animate-slide-down">{toast}</div>}

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {tab === "dashboard" && <Dashboard data={data} setTab={setTab} />}
          {tab === "scholarship_control" && <ScholarshipControlTab data={data} act={act} />}
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
          {tab === "pagetexts" && <PageTextsTab settings={data.settings} act={act} />}
        </main>
      </div>
    </div>
  );
}

/* ========== DASHBOARD ========== */
function Dashboard({ data, setTab }: { data: AdminData; setTab: (t: any) => void }) {
  const pending = (data.applications || []).filter((a) => a.status === "pending").length;
  const selected = (data.applications || []).filter((a) => a.status === "selected").length;
  const rashanTotal = (data.rashanItems || []).reduce((s, i) => s + i.price, 0);
  const volCount = (data.volunteers || []).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">System Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => setTab("scholarship_control")} className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-amber-400">{data.settings.scholarship_results_published === "true" ? "LIVE" : "OPEN"}</div>
          <div className="text-sm font-bold text-white">Scholarship Control</div>
          <div className="text-xs text-slate-400">Countdown & Results</div>
        </button>
        <button onClick={() => setTab("applications")} className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-emerald-400">{pending}</div>
          <div className="text-sm font-bold text-white">Pending Applications</div>
          <div className="text-xs text-slate-400">Waiting for review</div>
        </button>
        <button onClick={() => setTab("applications")} className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-sky-400">{selected}</div>
          <div className="text-sm font-bold text-white">Selected Students</div>
          <div className="text-xs text-slate-400">Awarded scholarships</div>
        </button>
        <button onClick={() => setTab("families")} className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-indigo-400">{(data.families || []).length}</div>
          <div className="text-sm font-bold text-white">Registered Families</div>
          <div className="text-xs text-slate-400">In rashan directory</div>
        </button>
        <button onClick={() => setTab("volunteers")} className="rounded-2xl border border-teal-400/30 bg-teal-400/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-teal-400">{volCount}</div>
          <div className="text-sm font-bold text-white">Registered Volunteers</div>
          <div className="text-xs text-slate-400">Youth across cities</div>
        </button>
        <button onClick={() => setTab("donations")} className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-amber-300">{(data.donations || []).length}</div>
          <div className="text-sm font-bold text-white">Donation Proofs</div>
          <div className="text-xs text-slate-400">Payment screenshots</div>
        </button>
        <button onClick={() => setTab("rashan")} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-emerald-300">{formatPKR(rashanTotal)}</div>
          <div className="text-sm font-bold text-white">Rashan Package Cost</div>
          <div className="text-xs text-slate-400">Auto-calculated</div>
        </button>
        <button onClick={() => setTab("reviews")} className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-left hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black text-yellow-400">{(data.reviews || []).length}</div>
          <div className="text-sm font-bold text-white">Community Reviews</div>
          <div className="text-xs text-slate-400">Total submitted</div>
        </button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-base font-extrabold text-white">Current Website Status</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-4 text-sm">
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60"><span className="text-xs text-slate-400 block">Families</span><span className="text-lg font-bold text-emerald-400">{data.settings.stat_families || "—"}</span></div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60"><span className="text-xs text-slate-400 block">Scholarships</span><span className="text-lg font-bold text-amber-300">{data.settings.stat_scholarships || "—"}</span></div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60"><span className="text-xs text-slate-400 block">Payment</span><span className="text-lg font-bold text-sky-400">{data.settings.payment_method_type || "—"}</span></div>
          <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60"><span className="text-xs text-slate-400 block">Results Status</span><span className="text-xs font-bold text-slate-200">{data.settings.scholarship_results_published === "true" ? "🎉 Published" : "⏳ Countdown"}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ========== SCHOLARSHIP CONTROL ========== */
function ScholarshipControlTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState({
    scholarship_countdown_enabled: data.settings.scholarship_countdown_enabled || "true",
    scholarship_deadline: data.settings.scholarship_deadline || "2025-06-30T23:59",
    scholarship_results_published: data.settings.scholarship_results_published || "false",
    scholarship_result_title: data.settings.scholarship_result_title || "Official Scholarship Winners List",
    scholarship_result_message: data.settings.scholarship_result_message || "Mubarak to all selected scholars!",
    scholarship_closed_message: data.settings.scholarship_closed_message || "Registration is closed. Results will be announced soon.",
    countdown_heading: data.settings.countdown_heading || "REGISTRATION CLOSES IN",
    countdown_deadline_label: data.settings.countdown_deadline_label || "Deadline:",
  });
  const [saving, setSaving] = useState(false);
  const selected = (data.applications || []).filter((a) => a.status === "selected");

  async function save() { setSaving(true); await act("updateSettings", { settings: s }); setSaving(false); }
  async function togglePublish() {
    const next = s.scholarship_results_published === "true" ? "false" : "true";
    if (next === "true" && !confirm(`Publish results? ${selected.length} students will be visible on the website.`)) return;
    setS({ ...s, scholarship_results_published: next });
    await act("updateSettings", { settings: { ...s, scholarship_results_published: next } });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white">⏳ Scholarship Countdown & Results</h1>
        <p className="mt-1 text-sm text-slate-400">Deadline set karein, countdown text customize karein, aur jab ready ho to results publish karein.</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 ${s.scholarship_results_published === "true" ? "border-emerald-500/60 bg-emerald-950/40" : "border-amber-500/60 bg-amber-950/40"}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${s.scholarship_results_published === "true" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <h3 className="text-lg font-black text-white">{s.scholarship_results_published === "true" ? "🎉 RESULTS ARE PUBLISHED LIVE" : "⏳ COUNTDOWN / REGISTRATION PHASE"}</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">{s.scholarship_results_published === "true" ? `${selected.length} selected students website par show ho rahe hain.` : "Countdown chal raha hai. Form open hai. Jab ready ho tab Publish Results dabayein."}</p>
        </div>
        <button onClick={togglePublish} className={`shrink-0 rounded-xl px-6 py-3 font-black text-sm shadow-xl transition ${s.scholarship_results_published === "true" ? "bg-red-600 hover:bg-red-500 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950"}`}>
          {s.scholarship_results_published === "true" ? "🔒 Hide Results" : "📢 PUBLISH RESULTS"}
        </button>
      </div>

      {/* Countdown Config */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <h3 className="font-extrabold text-white text-base">⏰ Countdown Configuration</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Registration Deadline (PKT)</label><input type="datetime-local" value={s.scholarship_deadline} onChange={(e) => setS({ ...s, scholarship_deadline: e.target.value })} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Countdown Display</label><select value={s.scholarship_countdown_enabled} onChange={(e) => setS({ ...s, scholarship_countdown_enabled: e.target.value })} className={`${inputCls} mt-1`}><option value="true">Active (Show Live Countdown)</option><option value="false">Hidden</option></select></div>
          <div><label className="text-xs font-bold text-slate-400">Countdown Heading (public page)</label><input value={s.countdown_heading} placeholder="REGISTRATION CLOSES IN" onChange={(e) => setS({ ...s, countdown_heading: e.target.value })} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Deadline Label (public page)</label><input value={s.countdown_deadline_label} placeholder="Deadline:" onChange={(e) => setS({ ...s, countdown_deadline_label: e.target.value })} className={`${inputCls} mt-1`} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-400">Closed Message (jab deadline guzar jaye)</label><textarea rows={2} value={s.scholarship_closed_message} onChange={(e) => setS({ ...s, scholarship_closed_message: e.target.value })} className={`${inputCls} mt-1`} /></div>
        </div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50">{saving ? "Saving…" : "💾 Save Countdown Settings"}</button>
      </div>

      {/* Result Announcement */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <h3 className="font-extrabold text-white text-base">🎉 Result Announcement</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Result Heading</label><input value={s.scholarship_result_title} onChange={(e) => setS({ ...s, scholarship_result_title: e.target.value })} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Result Message</label><input value={s.scholarship_result_message} onChange={(e) => setS({ ...s, scholarship_result_message: e.target.value })} className={`${inputCls} mt-1`} /></div>
        </div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50">{saving ? "Saving…" : "💾 Save Result Settings"}</button>
      </div>

      {/* Selected Students */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base">🎓 Selected Winners ({selected.length})</h3>
        {selected.length === 0 ? (
          <div className="rounded-xl bg-slate-950 p-6 text-center text-slate-500 text-sm">Koi student selected nahi hai abhi. Scholarship Applications ya Lucky Draw se select karein.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-900/50"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Father</th><th className="px-4 py-3">University</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Action</th></tr></thead>
              <tbody>
                {selected.map((st, i) => (
                  <tr key={st.id} className="border-b border-slate-800/60">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{st.fullName}</td>
                    <td className="px-4 py-3 text-slate-300">{st.fatherName}</td>
                    <td className="px-4 py-3 text-slate-300">{st.university}</td>
                    <td className="px-4 py-3 text-slate-300">{st.city}</td>
                    <td className="px-4 py-3"><button onClick={() => act("setApplicationStatus", { id: st.id, status: "approved" })} className={`${btnSm} bg-slate-800 text-amber-400 border border-slate-700`}>Remove</button></td>
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

/* ========== APPLICATIONS ========== */
function Applications({ data, act }: { data: AdminData; act: ActFn }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const apps = filter === "all" ? data.applications : data.applications.filter((a) => a.status === filter);
  const badge = (s: string) => ({ pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30", approved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", rejected: "bg-red-500/20 text-red-300 border border-red-500/30", selected: "bg-sky-500/20 text-sky-300 border border-sky-500/30" }[s] || "bg-slate-700 text-slate-300");
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-white">Scholarship Applications</h1><p className="mt-1 text-sm text-slate-400">Review documents. Approve or Select — emails are sent automatically.</p></div>
      <div className="flex flex-wrap gap-2">{["all", "pending", "approved", "selected", "rejected"].map((f) => (<button key={f} onClick={() => setFilter(f)} className={`${btnSm} capitalize ${filter === f ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{f}</button>))}</div>
      <div className="space-y-3">
        {apps.length === 0 && <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No applications found.</p>}
        {apps.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <button onClick={() => setOpenId(openId === a.id ? null : a.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-800/50 transition">
              <div><span className="font-extrabold text-white">{a.fullName}</span><span className="ml-2 text-sm text-slate-400">s/o {a.fatherName} — {a.university}, {a.city}</span></div>
              <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${badge(a.status)}`}>{a.status}</span><span className="text-xs text-slate-500">{formatPKT(a.createdAt)}</span></div>
            </button>
            {openId === a.id && (
              <div className="border-t border-slate-800 px-5 py-5 space-y-5 bg-slate-950/40">
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  {[["CNIC", a.cnic], ["Phone", a.phone], ["Email", a.email], ["University", a.university], ["Semester", a.semester], ["Fee", formatPKR(a.perSemesterFee)], ["City", a.city], ["Members", String(a.familyMembers ?? 1)], ["Guardian", a.guardianProfession]].map(([k, v]) => (<div key={k} className="rounded-xl bg-slate-900 p-3 border border-slate-800"><div className="text-[11px] font-bold uppercase text-slate-500">{k}</div><div className="font-semibold text-slate-200 mt-0.5">{v}</div></div>))}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Documents</h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[["Photo", a.studentPhoto], ["ID Front", a.idCardFront], ["ID Back", a.idCardBack], ["Voucher", a.feeVoucher], ["Fee Proof", a.paymentScreenshot]].map(([label, src]) => (<a key={label} href={src} target="_blank" rel="noreferrer" className="group block rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-2 text-center hover:border-emerald-500 transition"><div className="mb-1 text-[11px] font-bold text-slate-400 group-hover:text-emerald-300">{label}</div><img src={src} alt={label} className="h-28 w-full rounded-lg object-cover" /></a>))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => act("setApplicationStatus", { id: a.id, status: "approved" })} className={`${btnSm} bg-emerald-600 text-white`}>✅ Approve</button>
                  <button onClick={() => act("setApplicationStatus", { id: a.id, status: "selected" })} className={`${btnSm} bg-sky-600 text-white`}>🎉 Select</button>
                  <button onClick={() => act("setApplicationStatus", { id: a.id, status: "rejected" })} className={`${btnSm} bg-red-600/80 text-white`}>❌ Reject</button>
                  <button onClick={() => act("setApplicationStatus", { id: a.id, status: "pending" })} className={`${btnSm} bg-slate-800 text-slate-300 border border-slate-700`}>↩ Pending</button>
                  <a href={`mailto:${a.email}`} className={`${btnSm} bg-amber-400 text-emerald-950`}>✉️ Email</a>
                  <button onClick={() => { if (confirm("Delete this application?")) act("deleteApplication", { id: a.id }); }} className={`${btnSm} bg-slate-800 text-red-400 ml-auto`}>🗑 Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== LUCKY DRAW ========== */
function Draw({ data, act }: { data: AdminData; act: ActFn }) {
  const approved = data.applications.filter((a) => a.status === "approved");
  const selected = data.applications.filter((a) => a.status === "selected");
  const [count, setCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [winners, setWinners] = useState<{ id: number; fullName: string; fatherName: string; university: string; city: string }[] | null>(null);
  async function run() {
    if (!confirm(`Run lucky draw and select ${count} winner(s)? Emails will be sent and scholarship counter will increase.`)) return;
    setDrawing(true); setWinners(null);
    await new Promise((r) => setTimeout(r, 1200));
    const res = await act("runDraw", { count });
    if (res.winners) setWinners(res.winners as any);
    setDrawing(false);
  }
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-white">🎯 Lucky Draw Selection</h1><p className="mt-1 text-sm text-slate-400">Winners chosen at random from approved applicants. Confirmation emails sent automatically.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="text-3xl font-black text-emerald-400">{approved.length}</div><div className="text-sm font-semibold text-slate-300 mt-1">Approved in Draw Pool</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="text-3xl font-black text-amber-300">{data.settings.stat_scholarships || 0}</div><div className="text-sm font-semibold text-slate-300 mt-1">Public Scholarship Counter</div></div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <label className="text-sm font-bold text-slate-300">Number of winners</label>
        <div className="flex gap-3">
          <input type="number" min={1} max={Math.max(1, approved.length)} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${inputCls} max-w-[120px]`} />
          <button onClick={run} disabled={drawing || approved.length === 0} className="rounded-xl bg-amber-400 px-6 py-2.5 font-extrabold text-emerald-950 hover:bg-amber-300 disabled:opacity-50">{drawing ? "🎲 Drawing…" : "🎲 Run Draw"}</button>
        </div>
        {winners && (<div className="mt-4 rounded-xl border border-emerald-700/60 bg-emerald-950/60 p-5"><h3 className="font-extrabold text-amber-300">🎉 Winners:</h3><ul className="mt-3 space-y-2">{winners.map((w) => (<li key={w.id} className="rounded-lg bg-slate-900/80 px-4 py-2.5 text-sm border border-slate-800"><b className="text-white">{w.fullName}</b> <span className="text-slate-400">s/o {w.fatherName} — {w.university}, {w.city}</span></li>))}</ul></div>)}
      </div>
      {selected.length > 0 && (<div className="space-y-2"><h2 className="font-extrabold text-white text-lg">All Selected ({selected.length})</h2>{selected.map((a) => (<div key={a.id} className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"><span><b className="text-white">{a.fullName}</b> <span className="text-slate-400">— {a.university}, {a.city}</span></span><span className="text-xs text-slate-400">{a.phone}</span></div>))}</div>)}
    </div>
  );
}

/* ========== DONATIONS ========== */
function Donations({ data, act }: { data: AdminData; act: ActFn }) {
  const label = (p: string) => ({ general: "General Fund", rashan: "Rashan Package", scholarship: "Scholarship" }[p] || p);
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-white">Donation Proofs ({data.donations.length})</h1></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.donations.length === 0 && <p className="col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No donations yet.</p>}
        {data.donations.map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between"><span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">{label(d.purpose)}</span><span className="text-xs text-slate-500">{formatPKT(d.createdAt)}</span></div>
            <a href={d.screenshot} target="_blank" rel="noreferrer" className="block"><img src={d.screenshot} alt="Donation" className="h-44 w-full rounded-xl object-cover border border-slate-700" /></a>
            {d.message && <p className="text-xs italic text-slate-300">"{d.message}"</p>}
            <button onClick={() => { if (confirm("Delete?")) act("deleteDonation", { id: d.id }); }} className={`${btnSm} bg-slate-800 text-red-400`}>🗑 Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== RASHAN ========== */
function Rashan({ data, act }: { data: AdminData; act: ActFn }) {
  const [drafts, setDrafts] = useState<Record<number, RashanItem>>({});
  const [newItem, setNewItem] = useState({ name: "", quantity: "", price: "" });
  const total = useMemo(() => data.rashanItems.reduce((s, i) => s + i.price, 0), [data.rashanItems]);
  const families = parseInt(data.settings.stat_families) || 104;
  const draft = (item: RashanItem) => drafts[item.id] ?? item;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-white">🛒 Monthly Rashan Items & Prices</h1><p className="mt-1 text-sm text-slate-400">Update prices anytime. Total auto-calculates on the public website.</p></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-950/40"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Price (PKR)</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {data.rashanItems.map((item) => {
              const d = draft(item);
              const dirty = d.name !== item.name || d.quantity !== item.quantity || d.price !== item.price;
              return (
                <tr key={item.id} className="border-b border-slate-800/60">
                  <td className="px-4 py-2.5"><input value={d.name} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, name: e.target.value } })} className={inputCls} /></td>
                  <td className="px-4 py-2.5"><input value={d.quantity} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, quantity: e.target.value } })} className={inputCls} /></td>
                  <td className="px-4 py-2.5"><input type="number" value={d.price} onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, price: Number(e.target.value) } })} className={`${inputCls} max-w-[120px]`} /></td>
                  <td className="px-4 py-2.5"><div className="flex gap-2">
                    <button disabled={!dirty} onClick={async () => { await act("updateRashanItem", { id: item.id, name: d.name, quantity: d.quantity, price: d.price }); setDrafts((p) => { const c = { ...p }; delete c[item.id]; return c; }); }} className={`${btnSm} bg-emerald-600 text-white disabled:opacity-30`}>Save</button>
                    <button onClick={() => { if (confirm(`Remove "${item.name}"?`)) act("deleteRashanItem", { id: item.id }); }} className={`${btnSm} bg-slate-800 text-red-400`}>Delete</button>
                  </div></td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-3"><input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} /></td>
              <td className="px-4 py-3"><input placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className={inputCls} /></td>
              <td className="px-4 py-3"><input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className={`${inputCls} max-w-[120px]`} /></td>
              <td className="px-4 py-3"><button disabled={!newItem.name || !newItem.quantity || !newItem.price} onClick={async () => { await act("addRashanItem", { name: newItem.name, quantity: newItem.quantity, price: Number(newItem.price) }); setNewItem({ name: "", quantity: "", price: "" }); }} className={`${btnSm} bg-amber-400 text-emerald-950 font-extrabold disabled:opacity-30`}>+ Add</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5"><div className="text-xs uppercase font-bold text-emerald-400">Per Family</div><div className="text-3xl font-black text-amber-300 mt-1">{formatPKR(total)}</div></div>
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5"><div className="text-xs uppercase font-bold text-emerald-400">All {families} Families</div><div className="text-3xl font-black text-amber-300 mt-1">{formatPKR(total * families)}</div></div>
      </div>
    </div>
  );
}

/* ========== FAMILIES ========== */
function Families({ data, act }: { data: AdminData; act: ActFn }) {
  const empty = { familyHead: "", city: "", members: "1", phone: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const total = data.rashanItems.reduce((s, i) => s + i.price, 0);
  function startEdit(f: Family) { setEditId(f.id); setForm({ familyHead: f.familyHead, city: f.city, members: String(f.members), phone: f.phone || "", notes: f.notes || "" }); }
  async function save() { const p = { familyHead: form.familyHead, city: form.city, members: Number(form.members), phone: form.phone, notes: form.notes }; if (editId) await act("updateFamily", { id: editId, ...p }); else await act("addFamily", p); setForm(empty); setEditId(null); }
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-white">👨‍👩‍👧 Rashan Families ({data.families.length})</h1><p className="mt-1 text-sm text-slate-400">Monthly allocation: <strong className="text-amber-300">{formatPKR(total)}</strong> per family.</p></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="font-extrabold text-white text-base">{editId ? `Edit Family #${editId}` : "+ Add Family"}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input placeholder="Family head *" value={form.familyHead} onChange={(e) => setForm({ ...form, familyHead: e.target.value })} className={inputCls} />
          <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
          <input type="number" min="1" placeholder="Members" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} className={inputCls} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
        </div>
        <div className="flex gap-2">
          <button disabled={!form.familyHead || !form.city} onClick={save} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-extrabold text-white disabled:opacity-30">{editId ? "Save Changes" : "+ Add Family"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm(empty); }} className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button>}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500 bg-slate-950/40"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Family Head</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Members</th><th className="px-4 py-3">Allocation</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {data.families.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-white">{f.familyHead}{f.notes && <div className="text-xs font-normal text-slate-400">{f.notes}</div>}</td>
                <td className="px-4 py-3 text-slate-300">{f.city}</td>
                <td className="px-4 py-3 text-slate-300">{f.members}</td>
                <td className="px-4 py-3 font-bold text-amber-300">{formatPKR(total)}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => startEdit(f)} className={`${btnSm} bg-sky-600 text-white`}>Edit</button><button onClick={() => { if (confirm(`Delete "${f.familyHead}"?`)) act("deleteFamily", { id: f.id }); }} className={`${btnSm} bg-slate-800 text-red-400`}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== VOLUNTEERS ========== */
function Volunteers({ data, act }: { data: AdminData; act: ActFn }) {
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-white">🤝 Volunteer Registrations ({data.volunteers.length})</h1></div>
      <div className="space-y-3">
        {data.volunteers.length === 0 && <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No volunteers yet.</p>}
        {data.volunteers.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-extrabold text-white">{v.fullName} <span className="text-sm font-normal text-slate-400">s/o {v.fatherName} — {v.city}</span></span>
              <span className="text-xs text-slate-500">{formatPKT(v.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300">"{v.motivation}"</p>
            <div className="flex gap-4 text-xs text-slate-400 pt-1">
              <span>📞 {v.phone}</span>
              {v.email && <span>✉️ {v.email}</span>}
              <button onClick={() => { if (confirm("Delete volunteer?")) act("deleteVolunteer", { id: v.id }); }} className={`${btnSm} bg-slate-800 text-red-400 ml-auto`}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== REVIEWS ========== */
function Reviews({ data, act }: { data: AdminData; act: ActFn }) {
  const [editing, setEditing] = useState<Review | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  function openEdit(r: Review) { setEditing(r); setName(r.name); setMessage(r.message); setDate(new Date(r.createdAt).toISOString().slice(0, 16)); }
  async function saveEdit() { if (!editing) return; setSaving(true); await act("updateReview", { id: editing.id, name, message, createdAt: date ? new Date(date).toISOString() : undefined }); setSaving(false); setEditing(null); }
  const filtered = data.reviews.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.message.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-black text-white">⭐ Reviews ({data.reviews.length})</h1></div><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} max-w-xs`} /></div>
      {editing && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl"><div className="flex justify-between border-b border-slate-800 pb-3"><h3 className="font-extrabold text-white">Edit Review #{editing.id}</h3><button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">✕</button></div>
        <div><label className="text-xs font-bold text-slate-400">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} /></div>
        <div><label className="text-xs font-bold text-slate-400">Message</label><textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} mt-1`} /></div>
        <div><label className="text-xs font-bold text-slate-400">Date</label><input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1`} /></div>
        <div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300">Cancel</button><button disabled={saving} onClick={saveEdit} className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white">{saving ? "Saving…" : "Save"}</button></div>
      </div></div>)}
      <div className="space-y-3">
        {filtered.slice(0, 30).map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1"><div className="flex items-center gap-3"><span className="font-extrabold text-white">{r.name}</span><span className="text-xs text-slate-400">{formatPKT(r.createdAt)}</span></div><p className="mt-2 text-sm text-slate-300">{r.message}</p></div>
            <div className="flex gap-2 shrink-0"><button onClick={() => openEdit(r)} className={`${btnSm} bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600 hover:text-white`}>✏️ Edit</button><button onClick={() => { if (confirm(`Delete review from "${r.name}"?`)) act("deleteReview", { id: r.id }); }} className={`${btnSm} bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white`}>🗑 Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== IMAGES ========== */
function ImagesTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [heroImg, setHeroImg] = useState(data.settings.img_hero || "/images/hero.jpg");
  const [rashanImg, setRashanImg] = useState(data.settings.img_rashan || "/images/rashan.jpg");
  const [scholarshipImg, setScholarshipImg] = useState(data.settings.img_scholarship || "/images/scholarship.jpg");
  const [volunteerImg, setVolunteerImg] = useState(data.settings.img_volunteer || "/images/volunteer.jpg");
  const [saving, setSaving] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) { const file = e.target.files?.[0]; if (!file) return; try { setter(await fileToDataUrl(file, 1400)); } catch { alert("Invalid image."); } }
  async function saveAll() { setSaving(true); await act("updateSettings", { settings: { img_hero: heroImg, img_rashan: rashanImg, img_scholarship: scholarshipImg, img_volunteer: volunteerImg } }); setSaving(false); }
  const items = [
    { title: "1. Hero Banner", desc: "Home page top banner.", value: heroImg, setter: setHeroImg, def: "/images/hero.jpg" },
    { title: "2. Rashan Image", desc: "Home page rashan card.", value: rashanImg, setter: setRashanImg, def: "/images/rashan.jpg" },
    { title: "3. Scholarship Image", desc: "Home page scholarship card.", value: scholarshipImg, setter: setScholarshipImg, def: "/images/scholarship.jpg" },
    { title: "4. Volunteer Image", desc: "Home page volunteer card.", value: volunteerImg, setter: setVolunteerImg, def: "/images/volunteer.jpg" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-black text-white">🖼️ Website Images</h1><p className="mt-1 text-sm text-slate-400">Upload new photos. Website updates immediately.</p></div><button onClick={saveAll} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-3 font-extrabold text-white">{saving ? "Saving…" : "💾 Save All Images"}</button></div>
      <div className="grid gap-6 md:grid-cols-2">{items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div><h3 className="font-extrabold text-white">{item.title}</h3><p className="text-xs text-slate-400">{item.desc}</p></div>
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"><img src={item.value} alt="Preview" className="h-full w-full object-cover" /></div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white">📁 Upload<input type="file" accept="image/*" onChange={(e) => handleFile(e, item.setter)} className="hidden" /></label>
            <button onClick={() => item.setter(item.def)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300">Reset</button>
          </div>
        </div>
      ))}</div>
    </div>
  );
}

/* ========== EMAIL ========== */
function EmailTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState({ smtp_host: data.settings.smtp_host || "smtp.gmail.com", smtp_port: data.settings.smtp_port || "465", smtp_user: data.settings.smtp_user || "alhamdfoundation2012@gmail.com", smtp_pass: data.settings.smtp_pass || "", notification_email: data.settings.notification_email || "alhamdfoundation2012@gmail.com", email_enabled: data.settings.email_enabled || "false" });
  const [testTo, setTestTo] = useState("alhamdfoundation2012@gmail.com");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));
  async function save() { await act("updateSettings", { settings: s }); }
  async function sendTest() { setTesting(true); setResult(null); const res = await act("testEmail", { to: testTo }); setTesting(false); setResult(res.simulated ? "⚠️ Simulation mode" : res.success ? "✅ Test email sent!" : `❌ ${res.error}`); }
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-black text-white">✉️ Email & SMTP Settings</h1></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4"><h3 className="font-extrabold text-white">Email Dispatch</h3><button onClick={() => set("email_enabled", s.email_enabled === "true" ? "false" : "true")} className={`rounded-full px-4 py-1.5 text-xs font-bold ${s.email_enabled === "true" ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>{s.email_enabled === "true" ? "ENABLED" : "SIMULATION"}</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Notification Email</label><input value={s.notification_email} onChange={(e) => set("notification_email", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">SMTP Sender Email</label><input value={s.smtp_user} onChange={(e) => set("smtp_user", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Gmail App Password (16 letters)</label><input type="password" value={s.smtp_pass} onChange={(e) => set("smtp_pass", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-400">Host</label><input value={s.smtp_host} onChange={(e) => set("smtp_host", e.target.value)} className={`${inputCls} mt-1`} /></div><div><label className="text-xs font-bold text-slate-400">Port</label><input value={s.smtp_port} onChange={(e) => set("smtp_port", e.target.value)} className={`${inputCls} mt-1`} /></div></div>
        </div>
        <button onClick={save} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">💾 Save Email Settings</button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="font-extrabold text-white">🧪 Test Email</h3>
        <div className="flex gap-3"><input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={`${inputCls} max-w-md`} /><button onClick={sendTest} disabled={testing} className="rounded-xl bg-amber-400 px-6 py-2 text-sm font-extrabold text-emerald-950 disabled:opacity-50">{testing ? "Testing…" : "Send Test"}</button></div>
        {result && <div className="rounded-xl bg-slate-800/90 border border-slate-700 p-3.5 text-xs font-semibold text-slate-200">{result}</div>}
      </div>
    </div>
  );
}

/* ========== EMAIL TEMPLATES ========== */
function EmailTemplatesTab({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("new_admin");
  const val = (k: string) => s[k] ?? "";
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));
  async function save() { setSaving(true); const payload: Record<string, string> = { email_brand_title: val("email_brand_title"), email_brand_tagline: val("email_brand_tagline"), email_footer: val("email_footer") }; for (const t of TEMPLATE_LIST) { payload[`tpl_${t.key}_enabled`] = val(`tpl_${t.key}_enabled`) || "true"; payload[`tpl_${t.key}_subject`] = val(`tpl_${t.key}_subject`); payload[`tpl_${t.key}_body`] = val(`tpl_${t.key}_body`); } await act("updateSettings", { settings: payload }); setSaving(false); }
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between"><h1 className="text-2xl font-black text-white">📋 Email Templates</h1><button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">{saving ? "Saving…" : "💾 Save All"}</button></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">Email Branding</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Header Title</label><input value={val("email_brand_title")} onChange={(e) => set("email_brand_title", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Tagline</label><input value={val("email_brand_tagline")} onChange={(e) => set("email_brand_tagline", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-400">Footer</label><input value={val("email_footer")} onChange={(e) => set("email_footer", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>
      {TEMPLATE_LIST.map((t) => {
        const enabled = (val(`tpl_${t.key}_enabled`) || "true") === "true";
        const isOpen = open === t.key;
        return (
          <div key={t.key} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <button onClick={() => setOpen(isOpen ? null : t.key)} className="flex-1 text-left"><div className="font-extrabold text-white">{t.label}</div><div className="text-xs text-slate-400 mt-0.5">{t.desc}</div></button>
              <div className="flex items-center gap-2">
                <button onClick={() => set(`tpl_${t.key}_enabled`, enabled ? "false" : "true")} className={`rounded-full px-4 py-1.5 text-xs font-bold ${enabled ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>{enabled ? "ON" : "OFF"}</button>
                <button onClick={() => setOpen(isOpen ? null : t.key)} className={`${btnSm} bg-slate-800 text-slate-300 border border-slate-700`}>{isOpen ? "Close" : "Edit"}</button>
              </div>
            </div>
            {isOpen && (
              <div className="border-t border-slate-800 bg-slate-950/40 px-5 py-5 space-y-4">
                <div><label className="text-xs font-bold text-slate-400">Subject</label><input value={val(`tpl_${t.key}_subject`)} onChange={(e) => set(`tpl_${t.key}_subject`, e.target.value)} className={`${inputCls} mt-1`} /></div>
                <div><label className="text-xs font-bold text-slate-400">Body</label><textarea rows={8} value={val(`tpl_${t.key}_body`)} onChange={(e) => set(`tpl_${t.key}_body`, e.target.value)} className={`${inputCls} mt-1 leading-relaxed`} /></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ========== SETTINGS (ALL-IN-ONE) ========== */
function Settings({ data, act }: { data: AdminData; act: ActFn }) {
  const [s, setS] = useState<Record<string, string>>({ ...data.settings, admin_password: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-white">⚙️ Site Settings</h1><p className="mt-1 text-sm text-slate-400">Sab kuch yahan se control karein. Numbers, website text, payment, contact — ek jagah.</p></div>
        <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white">{saving ? "Saving…" : "💾 Save Settings"}</button>
      </div>

      {/* Numbers */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🔢 Public Numbers</h2>
        <p className="text-xs text-slate-400">Student select karne se scholarships auto +1. Family add karne se families auto +1.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Scholarships Awarded</label><input type="number" value={s.stat_scholarships || ""} onChange={(e) => set("stat_scholarships", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Rashan Families</label><input type="number" value={s.stat_families || ""} onChange={(e) => set("stat_families", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Years of Service</label><input type="number" value={s.stat_years || ""} onChange={(e) => set("stat_years", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Founded Year</label><input value={s.founded_year || ""} onChange={(e) => set("founded_year", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>

      {/* Scholarship */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🎓 Scholarship Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Application Fee (PKR)</label><input value={s.application_fee || ""} onChange={(e) => set("application_fee", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Next Announcement Text</label><input value={s.next_announcement || ""} onChange={(e) => set("next_announcement", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-400">How It Works Description</label><textarea rows={3} value={s.scholarship_note || ""} onChange={(e) => set("scholarship_note", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">💳 Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Payment Method</label><input value={s.payment_method_type || ""} onChange={(e) => set("payment_method_type", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Account Title</label><input value={s.payment_account_title || ""} onChange={(e) => set("payment_account_title", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Account Number / IBAN</label><input value={s.payment_account_number || ""} onChange={(e) => set("payment_account_number", e.target.value)} className={`${inputCls} mt-1 font-mono`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Bank Name</label><input value={s.payment_bank_name || ""} onChange={(e) => set("payment_bank_name", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-400">Payment Note</label><textarea rows={2} value={s.payment_note || ""} onChange={(e) => set("payment_note", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>

            {/* Home Page — Hero */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🏠 Home Page Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-400">Hero Title (Main Heading)</label>
            <input value={s.home_hero_title || ""} onChange={(e) => set("home_hero_title", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-400">Hero Text (Description)</label>
            <textarea rows={3} value={s.home_hero_text || ""} onChange={(e) => set("home_hero_text", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
        </div>
      </div>

      {/* Rashan Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🛒 Home Rashan Card</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400">Card Title</label>
            <input value={s.home_rashan_card_title || ""} onChange={(e) => set("home_rashan_card_title", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Card Description</label>
            <textarea rows={3} value={s.home_rashan_card_desc || ""} onChange={(e) => set("home_rashan_card_desc", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Link Button Text</label>
            <input value={s.home_rashan_card_link || ""} onChange={(e) => set("home_rashan_card_link", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
        </div>
      </div>

      {/* Scholarship Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🎓 Home Scholarship Card</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400">Card Title</label>
            <input value={s.home_scholarship_card_title || ""} onChange={(e) => set("home_scholarship_card_title", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Card Description</label>
            <textarea rows={3} value={s.home_scholarship_card_desc || ""} onChange={(e) => set("home_scholarship_card_desc", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Link Button Text</label>
            <input value={s.home_scholarship_card_link || ""} onChange={(e) => set("home_scholarship_card_link", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
        </div>
      </div>

      {/* Volunteer Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🤝 Home Volunteer Card</h2>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400">Card Title</label>
            <input value={s.home_volunteer_card_title || ""} onChange={(e) => set("home_volunteer_card_title", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Card Description</label>
            <textarea rows={3} value={s.home_volunteer_card_desc || ""} onChange={(e) => set("home_volunteer_card_desc", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Link Button Text</label>
            <input value={s.home_volunteer_card_link || ""} onChange={(e) => set("home_volunteer_card_link", e.target.value)} className={`${inputCls} mt-1`} />
          </div>
        </div>
      </div>

      {/* Ayat & Page Content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">📋 Ayat & Page Content</h2>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-400">Rashan Page Intro</label><textarea rows={2} value={s.rashan_intro || ""} onChange={(e) => set("rashan_intro", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Volunteer Page Intro</label><textarea rows={2} value={s.volunteer_intro || ""} onChange={(e) => set("volunteer_intro", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Quran Ayat (Arabic)</label><textarea rows={2} dir="rtl" value={s.donate_ayat || ""} onChange={(e) => set("donate_ayat", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Ayat Urdu</label><textarea rows={2} dir="rtl" value={s.donate_ayat_urdu || ""} onChange={(e) => set("donate_ayat_urdu", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Ayat English</label><textarea rows={2} value={s.donate_ayat_translation || ""} onChange={(e) => set("donate_ayat_translation", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">📞 Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-slate-400">Email</label><input value={s.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div><label className="text-xs font-bold text-slate-400">Phone / WhatsApp</label><input value={s.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} className={`${inputCls} mt-1`} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-400">Address</label><input value={s.contact_address || ""} onChange={(e) => set("contact_address", e.target.value)} className={`${inputCls} mt-1`} /></div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h2 className="font-extrabold text-white text-base">🔐 Admin Security</h2>
        <div><label className="text-xs font-bold text-slate-400">New Password (blank to keep current)</label><input type="password" placeholder="Min 6 characters" value={s.admin_password || ""} onChange={(e) => set("admin_password", e.target.value)} className={`${inputCls} mt-1`} /></div>
      </div>

      <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60 transition shadow-xl">{saving ? "Saving…" : "💾 Save All Settings"}</button>
    </div>
  );
}
