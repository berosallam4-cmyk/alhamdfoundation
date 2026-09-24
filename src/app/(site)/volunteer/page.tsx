import { getAllSettings } from "@/lib/settings";
import VolunteerForm from "./VolunteerForm";

export const dynamic = "force-dynamic";

export default async function VolunteerPage() {
  const s = await getAllSettings();

  return (
    <div className="bg-stone-50">
      <section className="bg-emerald-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-extrabold">🤝 Join Alhamd Foundation</h1>
          <p className="mt-3 max-w-2xl text-lg text-emerald-100">
            {s.volunteer_intro}
          </p>
          <p className="mt-4 inline-block rounded-full bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-emerald-950">
            100% FREE — No Fee Required
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold text-emerald-900">
            Why Join Us?
          </h2>
          <ul className="mt-5 space-y-4">
            {[
              ["🌙", "Work in the path of Allah and earn Sadaqah-e-Jariyah."],
              ["🏙️", "Youth from any city can join — we are growing city by city."],
              ["📦", "Help distribute monthly rashan to deserving families."],
              ["🎓", "Help organize the scholarship program and lucky draws."],
              ["💚", "Be part of a 14-year legacy of serving humanity since 2012."],
            ].map(([icon, text]) => (
              <li key={text} className="flex gap-3 rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
                <span className="text-2xl">{icon}</span>
                <span className="text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <VolunteerForm />
      </section>
    </div>
  );
}
