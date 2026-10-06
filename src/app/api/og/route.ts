import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const ALLOWED = ["img_hero", "img_scholarship", "img_rashan", "img_volunteer"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const k = searchParams.get("k") || "img_hero";
  const key = ALLOWED.includes(k) ? k : "img_hero";

  const s = await getAllSettings();
  const value = s[key] || "/images/hero.jpg";

  if (value.startsWith("data:")) {
    const comma = value.indexOf(",");
    const mime = value.slice(5, comma).split(";")[0] || "image/jpeg";
    const buf = Buffer.from(value.slice(comma + 1), "base64");
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  return Response.redirect(new URL(value, req.url), 302);
}
