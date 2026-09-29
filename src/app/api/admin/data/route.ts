import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  donations,
  programApplications,
  programs,
  rashanFamilies,
  rashanItems,
  reviews,
  scholarshipApplications,
  volunteers,
} from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [settings, apps, dons, vols, revs, items, families, allPrograms, progApps] =
    await Promise.all([
      getAllSettings(),
      db.select().from(scholarshipApplications).orderBy(desc(scholarshipApplications.createdAt)),
      db.select().from(donations).orderBy(desc(donations.createdAt)),
      db.select().from(volunteers).orderBy(desc(volunteers.createdAt)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      db.select().from(rashanItems).orderBy(asc(rashanItems.id)),
      db.select().from(rashanFamilies).orderBy(asc(rashanFamilies.id)),
      db.select().from(programs).orderBy(desc(programs.createdAt)),
      db.select().from(programApplications).orderBy(desc(programApplications.createdAt)),
    ]);

  return NextResponse.json({
    settings,
    applications: apps,
    donations: dons,
    volunteers: vols,
    reviews: revs,
    rashanItems: items,
    families,
    programs: allPrograms,
    programApplications: progApps,
  });
}
