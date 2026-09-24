import { asc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { rashanItems } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RashanPage() {
  const [s, items] = await Promise.all([
    getAllSettings(),
    db.select().from(rashanItems).orderBy(asc(rashanItems.id)),
  ]);
  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="bg-stone-50">
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${s.img_rashan || "/images/rashan.jpg"})` }}
      >
        <div className="absolute inset-0 bg-emerald-950/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <h1 className="text-4xl font-extrabold">🛒 Monthly Rashan Program</h1>
          <p className="mt-3 max-w-2xl text-lg text-emerald-100">
            {s.stat_families} deserving families receive a complete rashan
            package every month, Alhamdulillah.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-emerald-900">
          What One Family Receives Each Month
        </h2>
        <p className="mt-2 text-slate-600">{s.rashan_intro}</p>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-900 text-white">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3 text-right">Current Price</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Rashan items will be listed here soon.
                  </td>
                </tr>
              )}
              {items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 ? "bg-stone-50" : "bg-white"}>
                  <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{item.name}</td>
                  <td className="px-5 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-800">
                    {formatPKR(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-amber-100 text-emerald-950">
                <td colSpan={3} className="px-5 py-4 text-base font-extrabold">
                  Total Cost — One Family / One Month
                </td>
                <td className="px-5 py-4 text-right text-lg font-extrabold">
                  {formatPKR(total)}
                </td>
              </tr>
              <tr className="bg-emerald-900 text-white">
                <td colSpan={3} className="px-5 py-3 font-bold">
                  Monthly Cost for all {s.stat_families} Families
                </td>
                <td className="px-5 py-3 text-right font-extrabold text-amber-300">
                  {formatPKR(total * (parseInt(s.stat_families) || 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          * Prices are updated regularly by the foundation according to current
          market rates, so totals always stay accurate.
        </p>

        <div className="mt-10 rounded-2xl bg-emerald-900 p-8 text-center text-white">
          <h3 className="text-2xl font-extrabold">
            Sponsor a Family for {formatPKR(total)}/month
          </h3>
          <p className="mt-2 text-emerald-100">
            Your single donation can feed an entire family for a whole month.
          </p>
          <Link
            href="/donate"
            className="mt-5 inline-block rounded-lg bg-amber-400 px-8 py-3 font-extrabold text-emerald-950 hover:bg-amber-300"
          >
            Donate Rashan Now
          </Link>
        </div>
      </section>
    </div>
  );
}
