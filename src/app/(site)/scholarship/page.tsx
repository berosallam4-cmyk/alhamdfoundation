import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipApplications } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import ApplyForm from "./ApplyForm";
import PaymentDetails from "./PaymentDetails";
import ScholarshipCountdown from "./ScholarshipCountdown";

export const dynamic = "force-dynamic";

function parsePkt(value?: string | null) {
  if (!value) return null;
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

export default async function ScholarshipPage() {
  const s = await getAllSettings();

  const resultsPublished = s.scholarship_results_published === "true";
  const countdownOn = s.scholarship_countdown_enabled !== "false";
  const deadline = parsePkt(s.scholarship_deadline);
  const deadlinePassed = deadline ? Date.now() > deadline.getTime() : false;
  const registrationOpen = !resultsPublished && !deadlinePassed;

  const winners = resultsPublished
    ? await db
        .select({
          id: scholarshipApplications.id,
          fullName: scholarshipApplications.fullName,
          fatherName: scholarshipApplications.fatherName,
          university: scholarshipApplications.university,
          city: scholarshipApplications.city,
        })
        .from(scholarshipApplications)
        .where(eq(scholarshipApplications.status, "selected"))
        .orderBy(desc(scholarshipApplications.id))
    : [];

  return (
    <div className="bg-stone-50">
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${s.img_scholarship || "/images/scholarship.jpg"})` }}
      >
        <div className="absolute inset-0 bg-emerald-950/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <h1 className="text-4xl font-extrabold">🎓 Scholarship Program</h1>
          <p className="mt-3 max-w-2xl text-lg text-emerald-100">
            {s.stat_scholarships} students have already received scholarships
            in {s.stat_years} years. You could be next, InshaAllah.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow ring-1 ring-slate-200">
            <div>
              <div className="text-3xl">💳</div>
              <h3 className="mt-2 font-bold text-emerald-900">
                Only Rs. {s.application_fee} Fee
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Each student pays only Rs. {s.application_fee} to apply. This fee
                pool itself funds the scholarships.
              </p>
            </div>
            <div>
              <PaymentDetails
                fee={s.application_fee}
                methodType={s.payment_method_type || "JazzCash"}
                accountTitle={s.payment_account_title}
                accountNumber={s.payment_account_number}
                bankName={s.payment_bank_name}
                note={s.payment_note}
              />
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow ring-1 ring-slate-200">
            <div className="text-3xl">📋</div>
            <h3 className="mt-2 font-bold text-emerald-900">Fair Selection</h3>
            <p className="mt-1 text-sm text-slate-600">
              Applications are reviewed by the Alhamd Foundation team. Selected
              students are announced through a transparent process so that
              every deserving student gets a fair chance.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow ring-1 ring-slate-200">
            <div className="text-3xl">📅</div>
            <h3 className="mt-2 font-bold text-emerald-900">Every 6 Months</h3>
            <p className="mt-1 text-sm text-slate-600">
              Scholarship announcements are made after every 6 months. All
              selected students of that cycle receive their scholarship,
              InshaAllah.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {registrationOpen && countdownOn && s.scholarship_deadline && (
            <ScholarshipCountdown deadline={s.scholarship_deadline} />
          )}

          {resultsPublished && (
            <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-200">
              <h2 className="text-2xl font-extrabold text-emerald-900">
                {s.scholarship_result_title || "Scholarship Results"}
              </h2>
              <p className="mt-2 text-slate-600">
                {s.scholarship_result_message ||
                  "Mubarak ho! Selected students ki list neeche hai."}
              </p>
              {winners.length === 0 ? (
                <p className="mt-6 rounded-xl bg-stone-100 p-4 text-sm text-slate-500">
                  Abhi selected students ki list khali hai.
                </p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Father Name</th>
                        <th className="px-3 py-2">University</th>
                        <th className="px-3 py-2">City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map((w, i) => (
                        <tr key={w.id} className="border-b border-slate-100">
                          <td className="px-3 py-3 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-3 font-bold text-emerald-950">
                            {w.fullName}
                          </td>
                          <td className="px-3 py-3">{w.fatherName}</td>
                          <td className="px-3 py-3">{w.university}</td>
                          <td className="px-3 py-3">{w.city}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!resultsPublished && deadlinePassed && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
              <h2 className="text-xl font-extrabold">Registration Closed</h2>
              <p className="mt-2 text-sm">
                {s.scholarship_closed_message ||
                  "Registration band ho chuki hai. Result jald announce hoga."}
              </p>
            </div>
          )}

          {registrationOpen && <ApplyForm feeAmount={s.application_fee} />}
        </div>
      </section>
    </div>
  );
}
