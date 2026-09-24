import { createHash } from "crypto";
import { cookies } from "next/headers";
import { getAllSettings } from "./settings";

const COOKIE_NAME = "alhamd_admin";
const SECRET = "alhamd-foundation-2012-secret";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password + SECRET).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const settings = await getAllSettings();
  return token === hashPassword(settings.admin_password);
}

export { COOKIE_NAME };
