import { ArrowLeft, BookOpen, Clock3, Leaf } from "lucide-react";
import Link from "next/link";
import { ShareButton } from "@/components/share-button";
import { BookmarkButton } from "@/components/bookmark-button";

export function PublicContentPage({
  kind,
  id,
  title,
  subject,
  body,
  imageUrl,
  readingMinutes,
  publishedAt,
  rich,
  slug,
}: {
  kind: "Post" | "Article";
  id: string;
  title: string;
  subject: string;
  body: string;
  imageUrl: string | null;
  readingMinutes: number;
  publishedAt: string;
  rich: boolean;
  slug?: string;
}) {
  const path = kind === "Article" ? `/articles/${slug}` : `/posts/${id}`;
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-zinc-200 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-black">
            <ArrowLeft className="size-4" aria-hidden="true" /> Home
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-full bg-black text-white"><Leaf className="size-4" /></span>
            Improism
          </Link>
          <div className="flex items-center gap-2"><BookmarkButton id={id} title={title} subject={subject} readTime={`${readingMinutes} min read`} /><ShareButton path={path} title={title} /></div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <span>{subject}</span><span>·</span><span>{kind}</span><span>·</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{readingMinutes} min read</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.055em] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-xs text-zinc-400">Published {new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(publishedAt))}</p>

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-[1.5rem] object-cover" />
        ) : (
          <div className="relative mt-8 grid aspect-[16/7] place-items-center overflow-hidden rounded-[1.5rem] bg-black text-white">
            <div className="absolute -right-16 -top-20 size-64 rounded-full border border-white/20" />
            {kind === "Article" ? <BookOpen className="size-12" strokeWidth={1.2} /> : <Leaf className="size-12" strokeWidth={1.2} />}
          </div>
        )}

        {rich ? (
          <div className="admin-rich mx-auto mt-10 max-w-2xl text-[1.04rem] leading-8 text-zinc-700" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <div className="mx-auto mt-10 max-w-2xl whitespace-pre-wrap text-[1.04rem] leading-8 text-zinc-700">{body}</div>
        )}
      </article>
    </main>
  );
}
