"use client";

import { useState } from "react";
import { fileToDataUrl } from "@/lib/imageUpload";

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-600 focus:outline-none";
const fileCls =
  "mt-1 w-full rounded-lg border border-dashed border-emerald-400 bg-emerald-50/50 px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1.5 file:text-white";

const EMPTY = {
  fullName: "",
  fatherName: "",
  cnic: "",
  phone: "",
  email: "",
  university: "",
  semester: "",
  perSemesterFee: "",
  city: "",
  guardianProfession: "",
  familyMembers: "",
};
type FormKey = keyof typeof EMPTY;

const FIELDS: {
  id: string;
  key: FormKey;
  label: string;
  ph: string;
  type?: string;
  min?: string;
}[] = [
  { id: "name", key: "fullName", label: "Student Full Name", ph: "e.g. Muhammad Ali" },
  { id: "father", key: "fatherName", label: "Father Name", ph: "Father's full name" },
  { id: "cnic", key: "cnic", label: "CNIC / B-Form Number", ph: "00000-0000000-0" },
  { id: "phone", key: "phone", label: "Active Phone Number", ph: "03xx-xxxxxxx" },
  { id: "email", key: "email", label: "Email Address", ph: "you@example.com", type: "email" },
  { id: "university", key: "university", label: "University / College", ph: "University name" },
  { id: "semester", key: "semester", label: "Current Semester", ph: "e.g. 3rd Semester" },
  { id: "fee", key: "perSemesterFee", label: "Fee Per Semester (PKR)", ph: "e.g. 45000", type: "number", min: "0" },
  { id: "city", key: "city", label: "City", ph: "Your city" },
  { id: "profession", key: "guardianProfession", label: "Father / Guardian Profession", ph: "e.g. Shopkeeper, Labourer" },
  {
    id: "members",
    key: "familyMembers",
    label: "Total Members in Family (Ghar mein kul kitne log hain)",
    ph: "e.g. 6",
    type: "number",
    min: "1",
  },
];

type Images = {
  studentPhoto: string | null;
  idCardFront: string | null;
  idCardBack: string | null;
  feeVoucher: string | null;
  paymentScreenshot: string | null;
};

export default function ApplyForm({
  feeAmount,
  texts,
}: {
  feeAmount: string;
  texts?: Record<string, string>;
}) {
  const t = texts || {};
  const [form, setForm] = useState({ ...EMPTY });
  const [images, setImages] = useState<Images>({
    studentPhoto: null,
    idCardFront: null,
    idCardBack: null,
    feeVoucher: null,
    paymentScreenshot: null,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onFile(field: keyof Images, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await fileToDataUrl(f);
      setImages((im) => ({ ...im, [field]: data }));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File error");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    for (const [k, v] of Object.entries(images)) {
      if (!v) {
        setError(
          `Please upload: ${
            {
              studentPhoto: "your photo",
              idCardFront: "ID card front picture",
              idCardBack: "ID card back picture",
              feeVoucher: "last paid fee voucher",
              paymentScreenshot: `Rs. ${feeAmount} application fee screenshot`,
            }[k as keyof Images]
          }`
        );
        return;
      }
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...images }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-10 rounded-2xl bg-emerald-50 p-10 text-center ring-1 ring-emerald-200">
        <div className="text-5xl">✅</div>
        <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">
          Application Submitted!
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-emerald-800">
          Your scholarship application has been received by Alhamd Foundation
          (alhamdfoundation2012@gmail.com). After review and approval, your
          name will be included in the next lucky draw. Best of luck,
          InshaAllah!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8">
      <h2 className="text-2xl font-extrabold text-emerald-900">
        {t.heading || "Scholarship Application Form"}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {t.subheading || `Fill all fields carefully. Application fee: Rs. ${feeAmount}.`}
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.id}>
            <label className="text-sm font-bold text-slate-700">
              {t[`${f.id}_label`] || f.label} *
            </label>
            <input
              required
              type={f.type || "text"}
              min={f.min}
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className={inputCls}
              placeholder={t[`${f.id}_ph`] || f.ph}
            />
          </div>
        ))}
      </div>

      <h3 className="mt-8 border-t border-slate-200 pt-6 text-lg font-bold text-emerald-900">
        📎 Required Documents (Images)
      </h3>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-700">Your Photo *</label>
          <input type="file" accept="image/*" onChange={(e) => onFile("studentPhoto", e)} className={fileCls} />
          {images.studentPhoto && <img src={images.studentPhoto} alt="Student" className="mt-2 h-24 rounded-lg object-cover ring-1 ring-slate-200" />}
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">ID Card (CNIC/B-Form) Front Picture *</label>
          <input type="file" accept="image/*" onChange={(e) => onFile("idCardFront", e)} className={fileCls} />
          {images.idCardFront && <img src={images.idCardFront} alt="ID Card Front" className="mt-2 h-24 rounded-lg object-cover ring-1 ring-slate-200" />}
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">ID Card (CNIC/B-Form) Back Picture *</label>
          <input type="file" accept="image/*" onChange={(e) => onFile("idCardBack", e)} className={fileCls} />
          {images.idCardBack && <img src={images.idCardBack} alt="ID Card Back" className="mt-2 h-24 rounded-lg object-cover ring-1 ring-slate-200" />}
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Last Paid Fee Voucher *</label>
          <input type="file" accept="image/*" onChange={(e) => onFile("feeVoucher", e)} className={fileCls} />
          {images.feeVoucher && <img src={images.feeVoucher} alt="Voucher" className="mt-2 h-24 rounded-lg object-cover ring-1 ring-slate-200" />}
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">
            Rs. {feeAmount} Application Fee Payment Screenshot *
          </label>
          <input type="file" accept="image/*" onChange={(e) => onFile("paymentScreenshot", e)} className={fileCls} />
          {images.paymentScreenshot && <img src={images.paymentScreenshot} alt="Payment" className="mt-2 h-24 rounded-lg object-cover ring-1 ring-slate-200" />}
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 w-full rounded-lg bg-emerald-700 py-3.5 text-lg font-extrabold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting Application…" : "Submit Application"}
      </button>
    </form>
  );
}
