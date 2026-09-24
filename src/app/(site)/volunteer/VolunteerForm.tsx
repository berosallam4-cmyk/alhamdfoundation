"use client";

import { useState } from "react";

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none";

export default function VolunteerForm() {
  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    city: "",
    phone: "",
    email: "",
    motivation: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center ring-1 ring-emerald-200">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">
          Welcome to the Family!
        </h2>
        <p className="mt-2 text-emerald-800">
          Your volunteer request has been received. Our team will contact you
          soon, InshaAllah.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8">
      <h2 className="text-xl font-extrabold text-emerald-900">
        Volunteer Registration (Free)
      </h2>
      <div className="mt-5 grid gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700">Full Name *</label>
          <input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Father Name *</label>
          <input required value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">City *</label>
            <input required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">Phone *</label>
            <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="03xx-xxxxxxx" />
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Email (optional)</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">
            Why do you want to join? *
          </label>
          <textarea required rows={3} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} className={inputCls} placeholder="Tell us why you want to work in the path of Allah…" />
        </div>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm font-bold text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-lg bg-emerald-700 py-3 font-extrabold text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting…" : "Join Now — Free"}
      </button>
    </form>
  );
}
