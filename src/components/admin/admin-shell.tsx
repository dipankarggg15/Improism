"use client";

import {
  BookOpenText,
  FileText,
  Gauge,
  Leaf,
  LogOut,
  PanelLeft,
  Tags,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/app/auth/actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/articles", label: "Articles", icon: BookOpenText },
  { href: "/admin/subjects", label: "Subjects", icon: Tags },
];

function Sidebar({ close, name }: { close?: () => void; name: string }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-zinc-950 px-4 py-5 text-white">
      <div className="flex items-center justify-between px-2">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={close}>
          <span className="grid size-9 place-items-center rounded-xl bg-white text-black">
            <Leaf className="size-4.5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Improism</span>
            <span className="block text-[0.64rem] uppercase tracking-[0.18em] text-zinc-500">Admin CMS</span>
          </span>
        </Link>
        {close && <button type="button" onClick={close} aria-label="Close navigation"><X className="size-5" /></button>}
      </div>
      <nav className="mt-8 space-y-1" aria-label="Admin navigation">
        {nav.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-white text-black" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="size-4.5" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <p className="truncate px-3 text-xs text-zinc-500">Signed in as</p>
        <p className="truncate px-3 pt-1 text-sm font-medium">{name || "Administrator"}</p>
        <form action={logout} className="mt-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4.5" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ children, name }: { children: ReactNode; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><Sidebar name={name} /></aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />
          <aside className="relative h-full w-72"><Sidebar name={name} close={() => setOpen(false)} /></aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-7 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-zinc-200" aria-label="Open navigation">
            <PanelLeft className="size-5" />
          </button>
          <p className="ml-3 text-sm font-semibold">Improism Admin</p>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
