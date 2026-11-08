import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/admin/page-heading";

export function ContentPreview({ kind, editHref, title, body, imageUrl, subject, status, rich = false }: { kind: string; editHref: string; title: string; body: string; imageUrl?: string | null; subject: string; status: string; rich?: boolean }) {
  return <div className="mx-auto max-w-4xl">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Link href={kind === "Article" ? "/admin/articles" : "/admin/posts"} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600"><ArrowLeft className="size-4" /> Back to {kind.toLowerCase()}s</Link>
      <Link href={editHref} className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white"><Pencil className="size-4" /> Edit</Link>
    </div>
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {imageUrl ? <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="aspect-[16/8] w-full object-cover" />
      </> : <div className="grid aspect-[16/7] place-items-center bg-zinc-950 text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Improism</div>}
      <div className="p-6 sm:p-10">
        <div className="flex items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{subject} · {kind}</p><StatusBadge status={status} /></div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">{title}</h1>
        {rich ? <div className="admin-rich mt-8 text-base leading-8 text-zinc-700 sm:text-lg" dangerouslySetInnerHTML={{ __html: body }} /> : <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-zinc-700 sm:text-lg">{body}</p>}
      </div>
    </article>
  </div>;
}
