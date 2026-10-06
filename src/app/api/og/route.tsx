/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alhamdfoundation.vercel.app";
const PAGES = ["/", "/scholarship", "/donate", "/rashan", "/volunteer", "/reviews"];
const ALLOWED = ["img_hero", "img_scholarship", "img_rashan", "img_volunteer"];
const MAX_DATA_URL_CHARS = 3_500_000;
const MAX_FILE_BYTES = 3_000_000;

function clamp(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Asli page ka screenshot (bahar ki free service se) ---------- */
async function pageScreenshot(
  path: string
): Promise<{ data: ArrayBuffer; type: string } | null> {
  if (!PAGES.includes(path)) return null;
  try {
    const target = `${SITE}${path === "/" ? "" : path}`;
    const api =
      `https://api.microlink.io/?url=${encodeURIComponent(target)}` +
      `&screenshot=true&meta=false&embed=screenshot.url&force=true&type=jpeg` +
      `&viewport.width=1200&viewport.height=630&waitForTimeout=2500`;
    const res = await fetchWithTimeout(api, 12000);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const data = await res.arrayBuffer();
    if (data.byteLength < 5000 || data.byteLength > 7_000_000) return null;
    return { data, type };
  } catch {
    return null;
  }
}

/* ---------- Bachao ka card (agar screenshot na bane) ---------- */
async function loadFont(weight: 500 | 800) {
  try {
    const res = await fetchWithTimeout(
      `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.woff`,
      3000
    );
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function pickBackground(value: string, origin: string): Promise<string | null> {
  try {
    if (value.startsWith("data:")) {
      if (!/^data:image\/(jpeg|jpg|png);/i.test(value)) return null;
      return value.length <= MAX_DATA_URL_CHARS ? value : null;
    }
    if (!/\.(jpe?g|png)(\?.*)?$/i.test(value)) return null;
    const res = await fetchWithTimeout(new URL(value, origin).toString(), 4000);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_FILE_BYTES) return null;
    const mime = /\.png/i.test(value) ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 1) Pehle asli website screenshot try karo
  const path = url.searchParams.get("p");
  if (path && url.searchParams.get("mode") !== "card") {
    const shot = await pageScreenshot(path);
    if (shot) {
      return new Response(shot.data, {
        headers: {
          "Content-Type": shot.type,
          "Cache-Control":
            "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  }

  // 2) Screenshot na bane to purana card
  const k = url.searchParams.get("k") || "img_hero";
  const key = ALLOWED.includes(k) ? k : "img_hero";
  const title = clamp(url.searchParams.get("t") || "Alhamd Foundation", 80);
  const desc = clamp(url.searchParams.get("d") || "", 170);

  const s = await getAllSettings();
  const [bg, bold, medium] = await Promise.all([
    pickBackground(s[key] || "/images/hero.jpg", url.origin),
    loadFont(800),
    loadFont(500),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 800; style: "normal" }[] = [];
  if (bold) fonts.push({ name: "Inter", data: bold, weight: 800, style: "normal" });
  if (medium) fonts.push({ name: "Inter", data: medium, weight: 500, style: "normal" });

  const titleSize = title.length > 40 ? 58 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#022c22",
          fontFamily: fonts.length ? "Inter" : undefined,
        }}
      >
        {bg && (
          <img
            src={bg}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(2,44,34,0.96) 0%, rgba(6,78,59,0.88) 55%, rgba(2,44,34,0.70) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: "#fbbf24", marginRight: 14 }} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 4, color: "#fcd34d" }}>
              ALHAMD FOUNDATION
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, color: "#ffffff" }}>
              {title}
            </div>
            {desc && (
              <div style={{ display: "flex", marginTop: 28, fontSize: 31, fontWeight: 500, lineHeight: 1.4, color: "#d1fae5" }}>
                {desc}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                padding: "10px 26px",
                borderRadius: 14,
                background: "#fbbf24",
                color: "#022c22",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              Donate Now
            </div>
            <div style={{ display: "flex", marginLeft: 24, fontSize: 24, fontWeight: 500, color: "#a7f3d0" }}>
              alhamdfoundation.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    }
  );
}
