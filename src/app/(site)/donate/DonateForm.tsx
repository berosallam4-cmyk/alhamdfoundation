"use client";

import { useState } from "react";
import { fileToDataUrl } from "@/lib/imageUpload";

export default function DonateForm() {
  const [purpose, setPurpose] = useState("general");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setScreenshot(await fileToDataUrl(f));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File error");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!screenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, message, screenshot }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center ring-1 ring-emerald-200">
        <div className="text-5xl">🤲</div>
        <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">
          JazakAllah Khair!
        </h2>
        <p className="mt-2 text-emerald-800">
          Your donation proof has been submitted. May Allah accept it and
          multiply your reward.
        </p>
        <p className="mt-3 font-urdu text-emerald-700" dir="rtl">
          اللہ آپ کے صدقے کو قبول فرمائے اور اجرِ عظیم عطا فرمائے
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
      <h2 className="text-xl font-extrabold text-emerald-900">
        Submit Your Donation Proof
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        No name, phone or email needed.
      </p>

      <label className="mt-5 block text-sm font-bold text-slate-700">
        This donation is for *
      </label>
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none"
      >
        <option value="general">General Fund (where most needed)</option>
        <option value="rashan">Rashan for Families</option>
        <option value="scholarship">Student Scholarships</option>
      </select>

      <label className="mt-5 block text-sm font-bold text-slate-700">
        Payment Screenshot *
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className="mt-1 w-full rounded-lg border border-dashed border-emerald-400 bg-emerald-50/50 px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1.5 file:text-white"
      />
      {screenshot && (
        <img src={screenshot} alt="Screenshot preview" className="mt-3 max-h-48 rounded-lg ring-1 ring-slate-200" />
      )}

      <label className="mt-5 block text-sm font-bold text-slate-700">
        Optional Message
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Any dua request or message (optional)…"
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none"
      />

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      {status === "error" && (
        <p className="mt-3 text-sm font-medium text-red-600">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-lg bg-amber-400 py-3 font-extrabold text-emerald-950 shadow hover:bg-amber-300 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting…" : "Submit Donation Proof"}
      </button>
    </form>
  );
}
