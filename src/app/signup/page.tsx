import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account | Improism" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
