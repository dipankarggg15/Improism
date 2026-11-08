"use client";

import { ArrowRight, Leaf, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  login,
  requestPasswordReset,
  signup,
  updatePassword,
  type AuthState,
} from "@/app/auth/actions";

type Mode = "login" | "signup" | "forgot" | "update";

const initialState: AuthState = {};

export function AuthForm({ mode, next = "/", initialError }: { mode: Mode; next?: string; initialError?: string }) {
  const action = mode === "login"
    ? login
    : mode === "signup"
      ? signup
      : mode === "forgot"
        ? requestPasswordReset
        : updatePassword;
  const [state, formAction, pending] = useActionState(action, initialError ? { error: initialError } : initialState);

  const content = {
    login: {
      eyebrow: "Welcome back",
      title: "Continue becoming.",
      description: "Return to your ideas, conversations, and personal journeys.",
      submit: "Log in",
    },
    signup: {
      eyebrow: "Begin with intention",
      title: "Create your space.",
      description: "Build a thoughtful feed and keep what matters close.",
      submit: "Create account",
    },
    forgot: {
      eyebrow: "Password reset",
      title: "Find your way back.",
      description: "We’ll email you a secure link to choose a new password.",
      submit: "Send reset link",
    },
    update: {
      eyebrow: "Choose a new password",
      title: "Secure your account.",
      description: "Use at least eight characters for your new password.",
      submit: "Update password",
    },
  }[mode];

  return (
    <main className="grid min-h-dvh bg-white text-black lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.78fr)]">
      <section className="relative hidden overflow-hidden bg-black p-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-white text-black">
            <Leaf className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-[-0.045em]">Improism</span>
        </div>
        <div className="my-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Ideas for a more intentional life</p>
          <p className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] xl:text-6xl">
            A little better, a little more yourself.
          </p>
          <p className="mt-6 max-w-md text-base leading-7 text-white/55">
            Meaningful content, thoughtful AI conversations, and personal journeys—all in one calm place.
          </p>
        </div>
        <p className="text-xs text-white/35">© 2026 Improism</p>
        <div className="absolute -right-32 -top-28 size-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-48 left-24 size-[32rem] rounded-full border border-white/10" />
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center gap-2.5 lg:hidden" aria-label="Improism home">
            <span className="grid size-9 place-items-center rounded-full bg-black text-white">
              <Leaf className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-[-0.045em]">Improism</span>
          </Link>

          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">{content.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{content.title}</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-500">{content.description}</p>

          <form action={formAction} className="mt-8 space-y-4">
            {mode === "login" && <input type="hidden" name="next" value={next} />}
            {mode === "signup" && (
              <label className="block text-xs font-semibold text-zinc-600">
                Display name
                <span className="relative mt-2 block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input name="displayName" autoComplete="name" required className="w-full rounded-xl border border-zinc-300 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-black" />
                </span>
              </label>
            )}
            {mode !== "update" && (
              <label className="block text-xs font-semibold text-zinc-600">
                Email
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-zinc-300 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-black" />
                </span>
              </label>
            )}
            {(mode === "login" || mode === "signup" || mode === "update") && (
              <label className="block text-xs font-semibold text-zinc-600">
                {mode === "update" ? "New password" : "Password"}
                <span className="relative mt-2 block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required className="w-full rounded-xl border border-zinc-300 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-black" />
                </span>
              </label>
            )}
            {mode === "update" && (
              <label className="block text-xs font-semibold text-zinc-600">
                Confirm new password
                <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3.5 text-sm outline-none focus:border-black" />
              </label>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs font-semibold text-zinc-500 hover:text-black">Forgot password?</Link>
              </div>
            )}

            {state.error && <p role="alert" className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">{state.error}</p>}
            {state.success && <p role="status" className="rounded-xl bg-black px-4 py-3 text-sm text-white">{state.success}</p>}

            <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-wait disabled:bg-zinc-400">
              {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
              {pending ? "Please wait…" : content.submit}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            {mode === "login" && <>New to Improism? <Link href="/signup" className="font-semibold text-black">Create an account</Link></>}
            {mode === "signup" && <>Already have an account? <Link href="/login" className="font-semibold text-black">Log in</Link></>}
            {(mode === "forgot" || mode === "update") && <Link href="/login" className="font-semibold text-black">Back to login</Link>}
          </div>
        </div>
      </section>
    </main>
  );
}
