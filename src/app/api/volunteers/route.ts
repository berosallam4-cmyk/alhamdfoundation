import { NextResponse } from "next/server";
import { db } from "@/db";
import { volunteers } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim().slice(0, 150);
    const fatherName = String(body.fatherName || "").trim().slice(0, 150);
    const city = String(body.city || "").trim().slice(0, 100);
    const phone = String(body.phone || "").trim().slice(0, 30);
    const email = String(body.email || "").trim().slice(0, 150) || null;
    const motivation = String(body.motivation || "").trim().slice(0, 2000);
    if (!fullName || !fatherName || !city || !phone || !motivation) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }
    const [row] = await db
      .insert(volunteers)
      .values({ fullName, fatherName, city, phone, email, motivation })
      .returning({ id: volunteers.id });
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
