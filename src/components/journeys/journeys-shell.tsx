"use client";

import { Home, Leaf, Route, Sparkles, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "AI", icon: Sparkles, href: "/ai" },
  { label: "Journeys", icon: Route, href: "/journeys", active: true },
  { label: "Profile", icon: UserRound, href: "/profile" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Improism home">
      <span className="grid size-9 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
        <Leaf className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[1.35rem] font-semibold tracking-[-0.045em]">Improism</span>
    </Link>
  );
}

export function JourneysShell({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState("");

  return (
    <div className="h-dvh overflow-hidden bg-white text-black md:grid md:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="hidden h-dvh flex-col border-r border-zinc-200 px-5 py-7 md:flex">
        <Brand />
        <nav className="mt-10 space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const classes = `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
              item.active
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
            }`;

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={classes}
                aria-current={item.active ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => setNotice(`${item.label} is a prototype preview for now.`)}
                className={classes}
              >
                <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-zinc-200 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Journeys
          </p>
          <p className="mt-2 text-sm font-medium leading-5">
            Direction without pressure. Progress without perfection.
          </p>
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto pb-20 md:pb-0">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const classes = `flex flex-col items-center gap-1 py-1 text-[0.65rem] font-medium ${
              item.active ? "text-black" : "text-zinc-500"
            }`;
            const content = (
              <>
                <Icon className="size-5" strokeWidth={item.active ? 2.3 : 1.8} aria-hidden="true" />
                {item.label}
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={classes}
                aria-current={item.active ? "page" : undefined}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => setNotice(`${item.label} is a prototype preview for now.`)}
                className={classes}
              >
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      {notice && (
        <div
          className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-black px-4 py-3 text-sm text-white shadow-2xl md:bottom-6"
          role="status"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss message"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
