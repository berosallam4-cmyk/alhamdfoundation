import Link from "next/link";
import Image from "next/image";
import { desc, count } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { formatPKT } from "@/lib/format";
import Counter from "@/components/Counter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const s = await getAllSettings();

  const latestReviews = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(6);

  const [reviewCountRes] = await db.select({ value: count() }).from(reviews);
  const totalReviews = reviewCountRes.value;

  const numFamilies = parseInt(s.stat_families) || 104;
  const numScholarships = parseInt(s.stat_scholarships) || 143;
  const numYears = parseInt(s.stat_years) || 14;
  const foundedYear = s.founded_year || "2012";

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <Image
          src={s.img_hero || "/images/hero.jpg"}
          alt="Alhamd Foundation"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-950/70" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none animate-pulse-slow delay-300" />

        <div className="relative mx-auto max-w-6xl px-4 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/20 px-4 py-1.5 backdrop-blur-md animate-slide-down">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Est. {foundedYear} • {numYears} Years of Selfless Service
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-6xl drop-shadow-md animate-slide-up delay-100">
              {s.home_hero_title}
            </h1>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-emerald-100 drop-shadow animate-slide-up delay-200">
              {s.home_hero_text}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 animate-slide-up delay-300">
              <Link
                href="/donate"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-amber-400 px-7 py-3.5 font-extrabold text-emerald-950 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-amber-300 hover:shadow-amber-400/30 active:scale-95"
              >
                <span>Donate Now</span>
                <span className="text-lg transition-transform duration-300 group-hover:scale-125">❤</span>
              </Link>
              <Link
                href="/scholarship"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-emerald-950 active:scale-95"
              >
                <span>Apply for Scholarship</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Stats */}
      <section className="relative z-20 -mt-10 mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { target: numFamilies, suffix: "", icon: "🛒", label: "Families Receiving Monthly Rashan", bg: "from-emerald-800 to-emerald-900" },
            { target: numScholarships, suffix: "", icon: "🎓", label: "Deserving Students Awarded Scholarships", bg: "from-emerald-900 to-emerald-950" },
            { target: numYears, suffix: "+", icon: "⏳", label: `Years of Continuous Service Since ${foundedYear}`, bg: "from-emerald-800 to-emerald-900" },
          ].map((st) => (
            <div key={st.label} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${st.bg} p-6 text-center text-white shadow-xl ring-1 ring-emerald-700/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-amber-400/50`}>
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{st.icon}</div>
              <div className="text-4xl md:text-5xl font-black text-amber-300 tracking-tight transition-transform duration-300 group-hover:scale-105">
                <Counter target={st.target} suffix={st.suffix} />
              </div>
              <div className="mt-2 text-sm font-semibold text-emerald-100">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Program Cards — sab admin se editable */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">What We Do</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-emerald-950">Our Main Programs</h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Card 1: Rashan */}
          <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-emerald-400/60">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <Image src={s.img_rashan || "/images/rashan.jpg"} alt="Rashan" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute top-3 right-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-extrabold text-emerald-950 backdrop-blur-sm shadow z-10">{numFamilies} Families</div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                🛒 {s.home_rashan_card_title || "Monthly Rashan Package"}
              </h3>
              <p className="mt-2.5 flex-1 text-sm text-slate-600 leading-relaxed">
                {s.home_rashan_card_desc || "A complete food package delivered to families every month."}
              </p>
              <Link href="/rashan" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition-transform duration-200 group-hover:translate-x-1">
                <span>{s.home_rashan_card_link || "See complete item list & costs"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Scholarship */}
          <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-emerald-400/60">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <Image src={s.img_scholarship || "/images/scholarship.jpg"} alt="Students" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute top-3 right-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-extrabold text-emerald-950 backdrop-blur-sm shadow z-10">Rs. {s.application_fee} Fee</div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                🎓 {s.home_scholarship_card_title || "University Student Scholarship"}
              </h3>
              <p className="mt-2.5 flex-1 text-sm text-slate-600 leading-relaxed">
                {s.home_scholarship_card_desc || "Scholarships announced every 6 months for selected students."}
              </p>
              <Link href="/scholarship" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition-transform duration-200 group-hover:translate-x-1">
                <span>{s.home_scholarship_card_link || "Apply online for scholarship"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Volunteer */}
          <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-emerald-400/60">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <Image src={s.img_volunteer || "/images/volunteer.jpg"} alt="Volunteers" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute top-3 right-3 rounded-full bg-emerald-700 text-white px-3 py-1 text-xs font-extrabold backdrop-blur-sm z-10">100% Free Join</div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                🤝 {s.home_volunteer_card_title || "Volunteer in Allah's Path"}
              </h3>
              <p className="mt-2.5 flex-1 text-sm text-slate-600 leading-relaxed">
                {s.home_volunteer_card_desc || "Youth from all cities are welcome to join."}
              </p>
              <Link href="/volunteer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition-transform duration-200 group-hover:translate-x-1">
                <span>{s.home_volunteer_card_link || "Join our volunteer network"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 py-6 border-y border-amber-200">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 px-4 text-center">
          <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
          <p className="text-base font-extrabold text-emerald-950">📢 {s.next_announcement}</p>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Community Voices</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-emerald-950">{totalReviews}+ Reviews Across {numYears} Years</h2>
          </div>
          <Link href="/reviews" className="group inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg active:scale-95">
            <span>View All {totalReviews} Reviews</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestReviews.map((r) => (
            <div key={r.id} className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-emerald-300">
              <div>
                <div className="flex items-center gap-1 text-amber-400 text-sm">{"★".repeat(5)}</div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed italic">&ldquo;{r.message}&rdquo;</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800">{r.name.charAt(0).toUpperCase()}</div>
                  <span className="text-xs font-bold text-emerald-950">{r.name}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">{formatPKT(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/reviews" className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-700 bg-emerald-50 px-7 py-3 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-700 hover:text-white hover:scale-105 active:scale-95">
            <span>✍️ Read More or Leave Your Review</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
