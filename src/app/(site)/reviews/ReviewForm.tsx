"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) throw new Error();
      setName("");
      setMessage("");
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
      <h2 className="text-xl font-extrabold text-emerald-900">
        Write a Review
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Your review will be posted with the current date &amp; time.
      </p>
      <label className="mt-5 block text-sm font-bold text-slate-700">Your Name *</label>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none"
        placeholder="Your name"
      />
      <label className="mt-4 block text-sm font-bold text-slate-700">Your Review *</label>
      <textarea
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none"
        placeholder="Share your experience with Alhamd Foundation…"
      />
      {status === "done" && (
        <p className="mt-3 text-sm font-bold text-emerald-700">
          ✅ Thank you! Your review has been posted.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm font-bold text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-lg bg-emerald-700 py-3 font-extrabold text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {status === "sending" ? "Posting…" : "Post Review"}
      </button>
    </form>
  );
}
