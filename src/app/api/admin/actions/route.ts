import { NextResponse, after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  donations,
  rashanFamilies,
  rashanItems,
  reviews,
  scholarshipApplications,
  volunteers,
} from "@/db/schema";
import { COOKIE_NAME, hashPassword, isAdmin } from "@/lib/auth";
import { SETTING_DEFAULTS, getAllSettings, setSetting } from "@/lib/settings";
import { sendEmail } from "@/lib/mailer";
import { sendTemplateEmail } from "@/lib/emailTemplates";

// Allow enough time on serverless hosts (Vercel) for emails & image saves.
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  try {
    switch (body.action as string) {
      case "setApplicationStatus": {
        const status = String(body.status);
        if (!["pending", "approved", "rejected", "selected"].includes(status)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        const [app] = await db
          .select()
          .from(scholarshipApplications)
          .where(eq(scholarshipApplications.id, Number(body.id)));

        await db
          .update(scholarshipApplications)
          .set({ status })
          .where(eq(scholarshipApplications.id, Number(body.id)));

               // Send the admin-editable template email for this status change
        if (app) {
          const tplKey =
            status === "approved"
              ? "approve"
              : status === "selected"
              ? "lucky"
              : status === "rejected"
              ? "reject"
              : status === "pending"
              ? "withdraw"
              : null;

          if (tplKey) {
            after(async () => {
              try {
                await sendTemplateEmail({
                  key: tplKey,
                  to: app.email,
                  vars: {
                    id: app.id,
                    name: app.fullName,
                    fatherName: app.fatherName,
                    cnic: app.cnic,
                    phone: app.phone,
                    email: app.email,
                    university: app.university,
                    semester: app.semester,
                    city: app.city,
                    fee: app.perSemesterFee.toLocaleString("en-PK"),
                    reason: String(body.reason || ""),
                  },
                });
              } catch (e) {
                console.error("Status change email failed:", e);
              }
            });
          }
        }

      case "deleteApplication":
        await db
          .delete(scholarshipApplications)
          .where(eq(scholarshipApplications.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "runDraw": {
        const count = Math.max(1, Math.min(100, Number(body.count) || 1));
        const approved = await db
          .select()
          .from(scholarshipApplications)
          .where(eq(scholarshipApplications.status, "approved"));
        if (approved.length === 0) {
          return NextResponse.json(
            { error: "No approved applications available for the draw." },
            { status: 400 }
          );
        }
        // Shuffle (Fisher–Yates) and pick winners
        const pool = [...approved];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const winners = pool.slice(0, Math.min(count, pool.length));
        for (const w of winners) {
          await db
            .update(scholarshipApplications)
            .set({ status: "selected" })
            .where(eq(scholarshipApplications.id, w.id));
        }
        // Auto-increment the public scholarship counter
        const settings = await getAllSettings();
        const current = parseInt(settings.stat_scholarships) || 0;
        await setSetting("stat_scholarships", String(current + winners.length));
        return NextResponse.json({
          ok: true,
          winners: winners.map((w) => ({
            id: w.id,
            fullName: w.fullName,
            fatherName: w.fatherName,
            university: w.university,
            city: w.city,
          })),
          newTotal: current + winners.length,
        });
      }

      case "addRashanItem": {
        const [row] = await db
          .insert(rashanItems)
          .values({
            name: String(body.name).trim(),
            quantity: String(body.quantity).trim(),
            price: Math.max(0, Number(body.price) || 0),
          })
          .returning();
        return NextResponse.json({ ok: true, item: row });
      }

      case "updateRashanItem":
        await db
          .update(rashanItems)
          .set({
            name: String(body.name).trim(),
            quantity: String(body.quantity).trim(),
            price: Math.max(0, Number(body.price) || 0),
          })
          .where(eq(rashanItems.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "deleteRashanItem":
        await db.delete(rashanItems).where(eq(rashanItems.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "addFamily": {
        const [row] = await db
          .insert(rashanFamilies)
          .values({
            familyHead: String(body.familyHead).trim(),
            city: String(body.city).trim(),
            members: Math.max(1, Number(body.members) || 1),
            phone: String(body.phone || "").trim() || null,
            notes: String(body.notes || "").trim() || null,
          })
          .returning();
        return NextResponse.json({ ok: true, family: row });
      }

      case "updateFamily":
        await db
          .update(rashanFamilies)
          .set({
            familyHead: String(body.familyHead).trim(),
            city: String(body.city).trim(),
            members: Math.max(1, Number(body.members) || 1),
            phone: String(body.phone || "").trim() || null,
            notes: String(body.notes || "").trim() || null,
          })
          .where(eq(rashanFamilies.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "deleteFamily":
        await db
          .delete(rashanFamilies)
          .where(eq(rashanFamilies.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "updateReview": {
        const id = Number(body.id);
        const name = String(body.name || "").trim();
        const message = String(body.message || "").trim();
        if (!name || !message) {
          return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
        }
        let dateObj: Date | undefined;
        if (body.createdAt) {
          const d = new Date(body.createdAt);
          if (!isNaN(d.getTime())) dateObj = d;
        }
        await db
          .update(reviews)
          .set({
            name,
            message,
            ...(dateObj ? { createdAt: dateObj } : {}),
          })
          .where(eq(reviews.id, id));
        return NextResponse.json({ ok: true });
      }

      case "testEmail": {
        const to = String(body.to || "alhamdfoundation2012@gmail.com");
        const res = await sendEmail({
          to,
          subject: "🧪 Test Email — Alhamd Foundation System",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #064e3b; margin: 0 0 10px 0;">Alhamd Foundation</h2>
              <p style="color: #334155;">This is a test email sent from the Alhamd Foundation Admin Panel.</p>
              <p style="color: #16a34a; font-weight: bold;">✅ SMTP Configuration is working properly!</p>
              <p style="font-size: 12px; color: #64748b;">alhamdfoundation2012@gmail.com</p>
            </div>
          `,
        });
        return NextResponse.json(res);
      }

      case "deleteReview":
        await db.delete(reviews).where(eq(reviews.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "deleteDonation":
        await db.delete(donations).where(eq(donations.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "deleteVolunteer":
        await db.delete(volunteers).where(eq(volunteers.id, Number(body.id)));
        return NextResponse.json({ ok: true });

      case "updateSettings": {
        const updates = body.settings as Record<string, string>;
        if (!updates || typeof updates !== "object") {
          return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
        }
        let newPassword: string | null = null;
        for (const [key, value] of Object.entries(updates)) {
          if (!(key in SETTING_DEFAULTS)) continue; // only known keys
          const val = String(value);
          if (key === "admin_password") {
            if (!val.trim() || val.trim().length < 6) continue;
            newPassword = val.trim();
            await setSetting(key, newPassword);
          } else {
            await setSetting(key, val);
          }
        }
        const res = NextResponse.json({ ok: true });
        if (newPassword) {
          // Keep the admin logged in with the new password
          res.cookies.set(COOKIE_NAME, hashPassword(newPassword), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
        }
        return res;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Admin action failed:", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
