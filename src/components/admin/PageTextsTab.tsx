"use client";

import { useState } from "react";

type Props = {
  settings: Record<string, string>;
  act: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
};

type TextField = { key: string; label: string; def: string; multiline?: boolean };

const SECTIONS: { title: string; hint?: string; fields: TextField[] }[] = [
  {
    title: "🎓 Scholarship Page (upar wala banner)",
    fields: [
      { key: "page_sch_title", label: "Title", def: "Scholarship Program" },
      {
        key: "page_sch_text",
        label: "Neeche wali line",
        def: "{scholarships} students have already received scholarships in {years} years. You could be next, InshaAllah.",
        multiline: true,
      },
    ],
  },
  {
    title: "🃏 Scholarship Page ke 3 Cards",
    hint: "Banner ke neeche wale teen cards.",
    fields: [
      { key: "page_sch_c1_title", label: "Card 1 — Title", def: "Only Rs. {fee} Fee" },
      {
        key: "page_sch_c1_text",
        label: "Card 1 — Text",
        def: "Each student pays only Rs. {fee} to apply. This fee pool itself funds the scholarships.",
        multiline: true,
      },
      { key: "page_sch_c2_title", label: "Card 2 — Title", def: "Fair Selection" },
      {
        key: "page_sch_c2_text",
        label: "Card 2 — Text",
        def: "Applications are reviewed by the Alhamd Foundation team. Selected students are announced through a transparent process so that every deserving student gets a fair chance.",
        multiline: true,
      },
      { key: "page_sch_c3_title", label: "Card 3 — Title", def: "Every 6 Months" },
      {
        key: "page_sch_c3_text",
        label: "Card 3 — Text",
        def: "Scholarship announcements are made after every 6 months. All selected students of that cycle receive their scholarship, InshaAllah.",
        multiline: true,
      },
    ],
  },
  {
    title: "📝 Scholarship Form ka heading",
    fields: [
      { key: "form_heading", label: "Form ka Title", def: "Scholarship Application Form" },
      {
        key: "form_subheading",
        label: "Form ke neeche chhoti line",
        def: "Fill all fields carefully. Application fee: Rs. {fee}.",
      },
    ],
  },
  {
    title: "🛒 Rashan Page (upar wala banner)",
    fields: [
      { key: "page_rashan_title", label: "Title", def: "Monthly Rashan Program" },
      {
        key: "page_rashan_text",
        label: "Neeche wali line",
        def: "{families} deserving families receive a complete rashan package every month, Alhamdulillah.",
        multiline: true,
      },
    ],
  },
  {
    title: "⭐ Reviews Page (upar wala banner)",
    fields: [
      { key: "page_rev_badge", label: "Peeli chhoti patti", def: "{reviews}+ Reviews ({founded} – Present)" },
      { key: "page_rev_title", label: "Title", def: "Community Reviews" },
      {
        key: "page_rev_text",
        label: "Neeche wali line",
        def: "Alhamd Foundation has touched thousands of lives over the last {years} years. Every review displays the exact Pakistan Standard Time (PKT) it was posted.",
        multiline: true,
      },
      { key: "page_rev_total_label", label: "Daayen box ka likha (number ke neeche)", def: "Total Verified Reviews" },
    ],
  },
];

const FORM_FIELDS: { id: string; label: string; ph: string }[] = [
  { id: "name", label: "Student Full Name", ph: "e.g. Muhammad Ali" },
  { id: "father", label: "Father Name", ph: "Father's full name" },
  { id: "cnic", label: "CNIC / B-Form Number", ph: "00000-0000000-0" },
  { id: "phone", label: "Active Phone Number", ph: "03xx-xxxxxxx" },
  { id: "email", label: "Email Address", ph: "you@example.com" },
  { id: "university", label: "University / College", ph: "University name" },
  { id: "semester", label: "Current Semester", ph: "e.g. 3rd Semester" },
  { id: "fee", label: "Fee Per Semester (PKR)", ph: "e.g. 45000" },
  { id: "city", label: "City", ph: "Your city" },
  { id: "profession", label: "Father / Guardian Profession", ph: "e.g. Shopkeeper, Labourer" },
  { id: "members", label: "Total Members in Family (Ghar mein kul kitne log hain)", ph: "e.g. 6" },
];

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition";

export default function PageTextsTab({ settings, act }: Props) {
  const allKeys: string[] = [];
  for (const sec of SECTIONS) for (const f of sec.fields) allKeys.push(f.key);
  for (const f of FORM_FIELDS) allKeys.push(`form_${f.id}_label`, `form_${f.id}_ph`);

  const [v, setV] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of allKeys) init[k] = settings[k] || "";
    return init;
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  async function save() {
    setSaving(true);
    await act("updateSettings", { settings: v });
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">📝 Page Texts &amp; Form Labels</h1>
          <p className="mt-1 text-sm text-slate-400">
            Yahan se pages ke heading, text, cards aur form ke field badlo. Box khali chhoro to default text chalega.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-black text-white hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "💾 Save"}
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-5">
        <h3 className="text-sm font-extrabold text-amber-300">Numbers khud badlen, is liye ye shortcodes likho</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["{families}", "{scholarships}", "{years}", "{fee}", "{reviews}", "{founded}"].map((c) => (
            <span key={c} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
              {c}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-emerald-100/80">
          Misaal: <b>{"{families}"}</b> families receive rashan. Website par ye khud 104, 105… ban jayega.
        </p>
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div>
            <h2 className="font-extrabold text-white text-base">{sec.title}</h2>
            {sec.hint && <p className="mt-1 text-xs text-slate-500">{sec.hint}</p>}
          </div>
          {sec.fields.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-400">{f.label}</label>
                {v[f.key] && (
                  <button
                    type="button"
                    onClick={() => set(f.key, "")}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300"
                  >
                    ↺ Default
                  </button>
                )}
              </div>
              {f.multiline ? (
                <textarea
                  rows={3}
                  value={v[f.key]}
                  placeholder={f.def}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              ) : (
                <input
                  value={v[f.key]}
                  placeholder={f.def}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div>
          <h2 className="font-extrabold text-white text-base">🧾 Scholarship Form ke Fields</h2>
          <p className="mt-1 text-xs text-slate-500">
            Baayen taraf field ka title, daayen taraf box ke andar ka halka text. Star (*) form khud lagata hai.
          </p>
        </div>
        <div className="hidden gap-3 text-[11px] font-bold uppercase text-slate-500 sm:grid sm:grid-cols-2">
          <span>Field ka Title</span>
          <span>Box ke andar ka text</span>
        </div>
        {FORM_FIELDS.map((f) => (
          <div key={f.id} className="grid gap-3 sm:grid-cols-2">
            <input
              value={v[`form_${f.id}_label`]}
              placeholder={f.label}
              onChange={(e) => set(`form_${f.id}_label`, e.target.value)}
              className={inputCls}
            />
            <input
              value={v[`form_${f.id}_ph`]}
              placeholder={f.ph}
              onChange={(e) => set(`form_${f.id}_ph`, e.target.value)}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60 transition shadow-xl"
      >
        {saving ? "Saving…" : "💾 Save"}
      </button>
    </div>
  );
}
