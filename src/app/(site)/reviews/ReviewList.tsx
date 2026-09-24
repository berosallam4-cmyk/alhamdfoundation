"use client";

import { useState } from "react";
import { formatPKT } from "@/lib/format";

type ReviewItem = {
  id: number;
  name: string;
  message: string;
  createdAt: string | Date;
};

export default function ReviewList({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [filterYear, setFilterYear] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);

  const years = Array.from(
    new Set(
      initialReviews.map((r) => new Date(r.createdAt).getFullYear().toString())
    )
  ).sort((a, b) => Number(b) - Number(a));

  const filtered = initialReviews.filter((r) => {
    const year = new Date(r.createdAt).getFullYear().toString();
    const matchesYear = filterYear === "all" || year === filterYear;
    const matchesSearch =
      search.trim() === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.message.toLowerCase().includes(search.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-emerald-900">
            Reviews ({filtered.length}{filtered.length !== initialReviews.length && ` of ${initialReviews.length}`})
          </h2>
          <p className="text-xs text-slate-500">From 2012 till today</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setVisibleCount(15);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Years (2012 - 2026)</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(15);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {displayed.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-slate-500 ring-1 ring-slate-200">
          No reviews found matching your filter.
        </p>
      )}

      {displayed.map((r) => (
        <div
          key={r.id}
          className="group rounded-xl bg-white p-5 shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ring-1 ring-slate-200"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 font-bold text-emerald-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800 transition-transform duration-300 group-hover:scale-110">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <span>
                <span className="block leading-tight">{r.name}</span>
                <span className="text-[11px] font-normal text-emerald-700">Verified Donor / Beneficiary</span>
              </span>
            </span>
            <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-slate-500">
              🕐 {formatPKT(r.createdAt)} PKT
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {r.message}
          </p>
        </div>
      ))}

      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow transition-all duration-200 hover:bg-emerald-600 hover:shadow-md active:scale-95"
          >
            Load More Reviews ({filtered.length - visibleCount} remaining) ↓
          </button>
        </div>
      )}
    </div>
  );
}
