"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/scholarship", label: "Scholarship" },
  { href: "/rashan", label: "Rashan Program" },
  { href: "/volunteer", label: "Join Us" },
  { href: "/reviews", label: "Reviews" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-emerald-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-xl font-bold text-emerald-900">
            AF
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight">
              Alhamd Foundation
            </span>
            <span className="block text-[11px] text-emerald-200">
              Serving Humanity Since 2012
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-emerald-700 text-amber-300"
                  : "text-emerald-100 hover:bg-emerald-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="ml-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-emerald-900 shadow hover:bg-amber-300"
          >
            Donate Now
          </Link>
        </nav>

        <button
          className="rounded-md p-2 hover:bg-emerald-800 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-emerald-800 bg-emerald-900 px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                pathname === l.href
                  ? "bg-emerald-700 text-amber-300"
                  : "text-emerald-100 hover:bg-emerald-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
