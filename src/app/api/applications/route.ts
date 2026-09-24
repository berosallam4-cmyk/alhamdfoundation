import { NextResponse, after } from "next/server";
import { db } from "@/db";
import { scholarshipApplications } from "@/db/schema";
import { sendEmail } from "@/lib/mailer";
import { getAllSettings } from "@/lib/settings";

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
        const foundationMail = settings.notification_email || "alhamdfoundation2012@gmail.com";

        // 1. Notification to Foundation
        await sendEmail({
          to: foundationMail,
          subject: `🎓 New Scholarship Application #${row.id} — ${fullName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <div style="background-color: #064e3b; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0;">Alhamd Foundation</h2>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #fde68a;">New Scholarship Application Received</p>
              </div>
              <h3 style="color: #064e3b; margin-top: 20px;">Application #${row.id} Details:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Student Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${fullName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Father Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${fatherName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">CNIC / B-Form:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${cnic}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${phone}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">University:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${university}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Semester:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${semester}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Semester Fee:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Rs. ${perSemesterFee.toLocaleString("en-PK")} PKR</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">City:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${city}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Guardian Profession:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${guardianProfession}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Family Members:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${familyMembers}</td></tr>
              </table>
              <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
                You can review documents (student photo, ID cards, fee voucher, and payment screenshot) directly inside the <strong>Admin Panel</strong>.
              </p>
            </div>
          `,
        });

        // 2. Confirmation to Student
        await sendEmail({
          to: email,
          subject: `✅ Application Received #${row.id} — Alhamd Foundation Scholarship`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <div style="background-color: #064e3b; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0;">Alhamd Foundation</h2>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #fde68a;">Serving Humanity Since 2012</p>
              </div>
              <p style="margin-top: 20px; font-size: 15px; color: #1e293b;">
                Dear <strong>${fullName}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Your scholarship application (<strong>#${row.id}</strong>) has been successfully received by <strong>Alhamd Foundation</strong>.
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 12px; margin: 15px 0; font-size: 13px; color: #334155;">
                <p style="margin: 0;"><strong>Status:</strong> Under Review</p>
                <p style="margin: 4px 0 0 0;"><strong>University:</strong> ${university} (${semester})</p>
                <p style="margin: 4px 0 0 0;"><strong>Application Fee:</strong> Received</p>
              </div>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Our committee will review your documents and verify the fee voucher. Selection announcements are made every 6 months.
              </p>
              <p style="font-size: 14px; color: #064e3b; font-weight: bold; margin-top: 20px;">
                May Allah grant you success in your studies!
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Alhamd Foundation • Email: alhamdfoundation2012@gmail.com
              </p>
            </div>
          `,
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
