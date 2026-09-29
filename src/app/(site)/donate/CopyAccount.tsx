"use client";

import { useState } from "react";

export default function CopyAccount({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = value.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const box = document.createElement("textarea");
      box.value = text;
      box.style.position = "fixed";
      box.style.left = "-9999px";
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      document.body.removeChild(box);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="font-num text-lg font-extrabold text-emerald-800"
          title="Number copy karne ke liye click karo"
        >
          {value}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
