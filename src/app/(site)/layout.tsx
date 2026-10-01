import type { ReactNode } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { getAllSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getAllSettings();
  const email = s.contact_email || "alhamdfoundation2012@gmail.com";
  const phone = s.contact_phone || "";
  const address = s.contact_address || "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <footer className="bg-emerald-950 text-emerald-100">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-amber-400">Alhamd Foundation</h3>
            <p className="text-sm leading-relaxed text-emerald-200">
              Working in the path of Allah since {s.founded_year || "2012"}. Monthly rashan for
              deserving families and scholarships for talented students — powered by your donations.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold text-amber-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-amber-300">Donate Now</Link></li>
              <li><Link href="/scholarship" className="hover:text-amber-300">Apply for Scholarship</Link></li>
              <li><Link href="/rashan" className="hover:text-amber-300">Rashan Program</Link></li>
              <li><Link href="/volunteer" className="hover:text-amber-300">Become a Volunteer</Link></li>
              <li><Link href="/reviews" className="hover:text-amber-300">Reviews</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold text-amber-400">Contact</h3>
            <p className="text-sm text-emerald-200">
              Email:{" "}
              <a href={`mailto:${email}`} className="text-amber-300 hover:underline">
                {email}
              </a>
            </p>
            {phone && (
              <p className="text-sm text-emerald-200 mt-1">
                Phone:{" "}
                <a href={`tel:${phone}`} className="text-amber-300 hover:underline">
                  {phone}
                </a>
              </p>
            )}
            {address && (
              <p className="text-sm text-emerald-200 mt-1">
                Address: <span className="text-emerald-100">{address}</span>
              </p>
            )}
            <p className="mt-4 text-sm italic text-emerald-200">
              "Wealth spent in the path of Allah is never lost."
            </p>
          </div>
        </div>
        <div className="border-t border-emerald-900 py-4 text-center text-xs text-emerald-400">
          © {s.founded_year || "2012"} – {new Date().getFullYear()} Alhamd Foundation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
