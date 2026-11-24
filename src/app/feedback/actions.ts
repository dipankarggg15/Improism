"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();
  const pagePath = String(formData.get("pagePath") ?? "").trim().slice(0, 500);
  if (message.length < 3 || message.length > 5000) throw new Error("Feedback must be between 3 and 5,000 characters.");
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) throw new Error("Authentication required.");
  const { error } = await supabase.from("feedback").insert({ user_id: data.user.id, message, page_path: pagePath });
  if (error) throw new Error(error.message);
  redirect("/feedback?sent=1");
}
