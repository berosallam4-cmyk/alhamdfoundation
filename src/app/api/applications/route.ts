import { NextResponse, after } from "next/server";
import { db } from "@/db";
import { scholarshipApplications } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { sendTemplateEmail } from "@/lib/emailTemplates";

// Allow enough time on serverless hosts (Vercel) to store images + send emails.
export const maxDuration = 30;

const requiredText = [
  "fullName",
  "fatherName",
  "cnic",
  "phone",
  "email",
  "university",
  "semester",
  "city",
  "guardianProfession",
] as const;

const requiredImages = [
  "studentPhoto",
  "idCardFront",
  "idCardBack",
  "feeVoucher",
  "paymentScreenshot",
] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    for (const field of requiredText) {
      if (!String(body[field] || "").trim()) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }
    for (const field of requiredImages) {
      if (!String(body[field] || "").startsWith("data:image/")) {
        return NextResponse.json({ error: `Missing image: ${field}` }, { status: 400 });
      }
    }
    const perSemesterFee = parseInt(String(body.perSemesterFee), 10);
    if (!Number.isFinite(perSemesterFee) || perSemesterFee < 0) {
      return NextResponse.json({ error: "Invalid semester fee" }, { status: 400 });
    }
    const familyMembers = parseInt(String(body.familyMembers), 10);
    if (!Number.isFinite(familyMembers) || familyMembers < 1) {
      return NextResponse.json({ error: "Invalid family members count" }, { status: 400 });
    }

    const fullName = String(body.fullName).trim().slice(0, 150);
    const fatherName = String(body.fatherName).trim().slice(0, 150);
    const cnic = String(body.cnic).trim().slice(0, 30);
    const phone = String(body.phone).trim().slice(0, 30);
    const email = String(body.email).trim().slice(0, 150);
    const university = String(body.university).trim().slice(0, 200);
    const semester = String(body.semester).trim().slice(0, 50);
    const city = String(body.city).trim().slice(0, 100);
    const guardianProfession = String(body.guardianProfession).trim().slice(0, 150);

    const [row] = await db
      .insert(scholarshipApplications)
      .values({
        fullName,
        fatherName,
        cnic,
        phone,
        email,
        university,
        semester,
        perSemesterFee,
        city,
        guardianProfession,
        familyMembers,
        studentPhoto: String(body.studentPhoto),
        idCardFront: String(body.idCardFront),
        idCardBack: String(body.idCardBack),
        feeVoucher: String(body.feeVoucher),
        paymentScreenshot: String(body.paymentScreenshot),
      })
      .returning({ id: scholarshipApplications.id });

    // Send emails after the response is sent (reliable on Vercel/serverless via after())
    after(async () => {
      try {
        const settings = await getAllSettings();
        const foundationMail =
          settings.notification_email || "alhamdfoundation2012@gmail.com";

        const vars = {
          id: row.id,
          name: fullName,
          fatherName,
          cnic,
          phone,
          email,
          university,
          semester,
          city,
          fee: perSemesterFee.toLocaleString("en-PK"),
          guardianProfession,
          familyMembers,
          reason: "",
        };

        // 1. Notification to Foundation
        await sendTemplateEmail({
          key: "new_admin",
          to: foundationMail,
          vars,
          settings,
        });

        // 2. Confirmation to Student
        await sendTemplateEmail({
          key: "new_student",
          to: email,
          vars,
          settings,
        });
      } catch (err) {
        console.error("Async email dispatch error:", err);
      }
    });

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
