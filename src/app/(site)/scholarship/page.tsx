import { getAllSettings } from "@/lib/settings";
import ApplyForm from "./ApplyForm";
import PaymentDetails from "./PaymentDetails";

export const dynamic = "force-dynamic";

export default async function ScholarshipPage() {
  const s = await getAllSettings();

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

        <ApplyForm feeAmount={s.application_fee} />
      </section>
    </div>
  );
}
