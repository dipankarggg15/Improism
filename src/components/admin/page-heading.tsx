import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHeading({
  eyebrow = "Admin CMS",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      {action && (
        <Link href={action.href} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800">
          <Plus className="size-4" />{action.label}
        </Link>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const style = status === "published" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : status === "archived" ? "bg-zinc-100 text-zinc-500 ring-zinc-200" : "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold capitalize ring-1 ring-inset ${style}`}>{status}</span>;
}
