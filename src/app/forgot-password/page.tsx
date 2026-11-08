import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Reset password | Improism" };

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" />;
}
