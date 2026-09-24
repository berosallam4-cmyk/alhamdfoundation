import { desc } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const allReviews = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="bg-stone-50">
      <section className="bg-emerald-900 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-emerald-950">
                143+ Reviews (2012 – Present)
              </span>
              <h1 className="mt-2 text-4xl font-extrabold">⭐ Community Reviews</h1>
              <p className="mt-2 max-w-xl text-sm text-emerald-100">
                Alhamd Foundation has touched thousands of lives over the last 14 years. Every review displays the exact Pakistan Standard Time (PKT) it was posted.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-800/80 p-4 text-center ring-1 ring-emerald-700">
              <div className="text-3xl font-extrabold text-amber-300">{allReviews.length}</div>
              <div className="text-xs font-semibold text-emerald-100">Total Verified Reviews</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <ReviewForm />
        </div>
        <div>
          <ReviewList initialReviews={allReviews} />
        </div>
      </section>
    </div>
  );
}
