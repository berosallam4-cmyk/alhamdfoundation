import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 100);
    const message = String(body.message || "").trim().slice(0, 2000);
    if (!name || !message) {
      return NextResponse.json({ error: "Name and review are required" }, { status: 400 });
    }
    const [row] = await db.insert(reviews).values({ name, message }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
