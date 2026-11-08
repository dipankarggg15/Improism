import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Choose a new password | Improism" };

export default function UpdatePasswordPage() {
  return <AuthForm mode="update" />;
}
