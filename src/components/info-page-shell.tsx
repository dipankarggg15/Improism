import { ArrowLeft, Leaf } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function InfoPageShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-black"><ArrowLeft className="size-4" />Home</Link>
          <Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid size-8 place-items-center rounded-full bg-black text-white"><Leaf className="size-4" /></span>Improism</Link>
        </div>
        <header className="mt-12 border-b border-zinc-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{title}</h1>
        </header>
        <div className="admin-rich mt-8 text-[1rem] leading-8 text-zinc-700">{children}</div>
      </div>
    </main>
  );
}
