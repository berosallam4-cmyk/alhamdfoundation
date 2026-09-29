"use client";

import { useEffect, useState } from "react";

function parseDeadline(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  const withZone =
    raw.length === 16
      ? `${raw}:00+05:00`
      : /(?:Z|[+-]\d{2}:\d{2})$/.test(raw)
      ? raw
      : `${raw}+05:00`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ScholarshipCountdown({ deadline }: { deadline: string }) {
  const target = parseDeadline(deadline);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target || now === null) {
    return (
      <div className="rounded-2xl bg-emerald-950 px-6 py-8 text-center text-emerald-100">
        Countdown load ho raha hai…
      </div>
    );
  }

  const remaining = Math.max(0, target.getTime() - now);
  const ended = remaining <= 0;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const boxes = [
    ["Days", days],
    ["Hours", hours],
    ["Minutes", minutes],
    ["Seconds", seconds],
  ] as const;

  return (
    <div className="rounded-2xl bg-emerald-950 px-6 py-8 text-center text-white shadow-lg">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
        {ended ? "Registration closed" : "Registration closes in"}
      </p>
      {!ended && (
        <div className="mt-5 grid grid-cols-4 gap-3">
          {boxes.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-emerald-900/80 px-2 py-4">
              <div className="text-3xl font-black tabular-nums text-amber-300 sm:text-4xl">
                {String(value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase text-emerald-200">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-emerald-100">
        Deadline:{" "}
        {target.toLocaleString("en-PK", {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
        PKT
      </p>
    </div>
  );
}
