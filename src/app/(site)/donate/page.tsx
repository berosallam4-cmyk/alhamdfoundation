import { getAllSettings } from "@/lib/settings";
import DonateForm from "./DonateForm";

export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const s = await getAllSettings();

  return (
    <div className="bg-stone-50">
      {/* Ayat section */}
      <section className="bg-emerald-950 py-16 text-center text-white">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-arabic text-2xl leading-loose text-amber-300 md:text-3xl" dir="rtl">
            {s.donate_ayat}
          </p>
          <p className="mt-6 font-urdu text-lg text-emerald-100" dir="rtl">
            {s.donate_ayat_urdu}
          </p>
          <p className="mt-6 text-sm italic text-emerald-300">
            “{s.donate_ayat_translation}”
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        {/* Payment details */}
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-900">
            Donate to Alhamd Foundation
          </h1>
          <p className="mt-3 text-slate-600">
            Since 2012 your donations have provided monthly rashan to{" "}
            <b>{s.stat_families} families</b> and scholarships to{" "}
            <b>{s.stat_scholarships} students</b>. Send your donation to the
            official account below, then submit the payment screenshot.
          </p>

          <div className="mt-6">
            <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-md ring-1 ring-emerald-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                  {s.payment_method_type === "Bank Transfer" ? "🏦" : "📱"} {s.payment_method_type || "JazzCash"}
                </span>
                <span className="text-xs font-semibold text-emerald-600">Official Account</span>
              </div>
              <div className="mt-4 space-y-2.5 text-sm text-slate-700">
                {s.payment_method_type === "Bank Transfer" && s.payment_bank_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bank Name</span>
                    <span className="font-bold text-slate-900">{s.payment_bank_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account Title</span>
                  <span className="font-bold text-slate-900">{s.payment_account_title}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">
                    {s.payment_method_type === "Bank Transfer" ? "Account / IBAN" : "Account Number"}
                  </span>
                  <span className="font-mono text-lg font-extrabold text-emerald-800 select-all">
                    {s.payment_account_number}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            💡 {s.payment_note} No phone number or email is required — your
            donation stays private.
          </p>
        </div>

        {/* Donation form */}
        <DonateForm />
      </div>
    </div>
  );
}
