"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("Wrong password. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-800"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-xl font-extrabold text-emerald-950">
          AF
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold text-white">
          Admin Panel
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Alhamd Foundation — Restricted Access
        </p>
        <label className="mt-6 block text-sm font-bold text-slate-300">
          Admin Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          placeholder="••••••••"
          autoFocus
        />
        {error && <p className="mt-3 text-sm font-bold text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-emerald-600 py-3 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? "Checking…" : "Login"}
        </button>
      </form>
    </div>
  );
}
