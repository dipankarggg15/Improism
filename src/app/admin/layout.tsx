import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin CMS | Improism",
  robots: { index: false, follow: false },
};

// Admin authorization reads the Supabase session cookie for every request.
export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Supabase validates token expiry with the current time. Admin authorization
  // is request-specific, so exclude the entire protected subtree from prerender.
  await connection();
  const { profile } = await requireAdmin();
  return <AdminShell name={profile.display_name}>{children}</AdminShell>;
}
