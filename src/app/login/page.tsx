import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in | Improism" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
};

async function LoginPageContent({
  searchParams,
}: LoginPageProps) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : "/";
  const error = typeof query.error === "string" ? query.error : undefined;
  return <AuthForm key={`${next}:${error ?? "none"}`} mode="login" next={next} initialError={error} />;
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <Suspense fallback={<AuthForm mode="login" />}>
      <LoginPageContent {...props} />
    </Suspense>
  );
}
