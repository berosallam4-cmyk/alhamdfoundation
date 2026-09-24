"use client";

import { useState } from "react";

type Props = {
  fee: string;
  methodType: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  note: string;
};

export default function PaymentDetails({
  fee,
  methodType,
  accountTitle,
  accountNumber,
  bankName,
  note,
}: Props) {
  const [open, setOpen] = useState(false);
  const isBank = methodType === "Bank Transfer";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900 cursor-pointer"
      >
        <span>💳 See Payment Details</span>
        <span aria-hidden="true">→</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">
                💳
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-emerald-950">
                  Payment Details
                </h3>
                <p className="text-xs text-slate-500">
                  Application Fee: <b className="text-emerald-800">Rs. {fee} PKR</b>
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Pay the Rs. {fee} fee to the official account below and attach the payment screenshot in the form:
            </p>

            {/* Single official payment method */}
            <div className="mt-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  {isBank ? "🏦" : "📱"} {methodType || "JazzCash"}
                </span>
                <span className="rounded-full bg-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  Official Account
                </span>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                {isBank && bankName && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-500">Bank Name</div>
                    <div className="font-extrabold text-slate-900">{bankName}</div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-500">Account Title</div>
                  <div className="font-extrabold text-slate-900">{accountTitle}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-500">
                    {isBank ? "Account Number / IBAN" : "Account Number"}
                  </div>
                  <div className="font-mono text-xl font-extrabold text-emerald-900 select-all">
                    {accountNumber}
                  </div>
                </div>
              </div>
            </div>

            {note && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
                💡 {note}
              </p>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
