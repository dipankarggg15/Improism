"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = {
  error?: string;
  success?: string;
};

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

function configurationError(): AuthState | null {
  return isSupabaseConfigured()
    ? null
    : { error: "Supabase is not configured. Add the required values to .env.local." };
}

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const configError = configurationError();
  if (configError) return configError;

  const { email, password } = credentials(formData);
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const configError = configurationError();
  if (configError) return configError;

  const { email, password } = credentials(formData);
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length < 2) return { error: "Enter a display name." };
  if (!email) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { success: "Check your email to confirm your account, then sign in." };
  }

  redirect("/");
}

export async function requestPasswordReset(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const configError = configurationError();
  if (configError) return configError;

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { error: error.message };

  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const configError = configurationError();
  if (configError) return configError;

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Your password has been updated. You can continue to Improism." };
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
