import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdmin();
  if (!authed) return <AdminLogin />;
  return <AdminPanel />;
}
