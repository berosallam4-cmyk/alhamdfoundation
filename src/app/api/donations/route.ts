import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const purpose = String(body.purpose || "general");
    const message = String(body.message || "").trim().slice(0, 2000) || null;
    const screenshot = String(body.screenshot || "");
    if (!screenshot.startsWith("data:image/")) {
      return NextResponse.json({ error: "Payment screenshot is required" }, { status: 400 });
    }
    if (!["general", "rashan", "scholarship"].includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }
    const [row] = await db
      .insert(donations)
      .values({ purpose, message, screenshot })
      .returning({ id: donations.id });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
