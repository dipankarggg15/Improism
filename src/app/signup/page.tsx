import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account | Improism" };
export const instant = false;

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <AuthForm mode="signup" initialSuccess={query.deleted === "1" ? "Your account and personal data were permanently deleted." : undefined} />;
}
