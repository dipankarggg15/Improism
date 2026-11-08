import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return { supabase, user: userData.user, profile };
}

export async function requireAdmin() {
  // Every protected page is validated as its own cache-components segment.
  // Supabase auth checks token expiry against the current time, so ensure the
  // check only runs for a real request rather than during prerendering.
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/?error=admin-access-required");
  return admin;
}

export async function assertAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("You are not authorized to manage content.");
  return admin;
}
