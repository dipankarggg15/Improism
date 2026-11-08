import { ArrowRight, BookOpenText, FileText, Tags } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

function hasArticle(value: unknown) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const [postsResult, subjectsResult] = await Promise.all([
    supabase.from("posts").select("id, subject_id, status, articles(id)"),
    supabase.from("subjects").select("id, name, is_active").order("name"),
  ]);
  const rows = postsResult.data ?? [];
  const subjects = subjectsResult.data ?? [];
  const ordinaryPosts = rows.filter((row) => !hasArticle(row.articles));
  const articleRows = rows.filter((row) => hasArticle(row.articles));
  const cards = [
    { label: "Total posts", value: ordinaryPosts.length, detail: `${ordinaryPosts.filter((row) => row.status === "published").length} published · ${ordinaryPosts.filter((row) => row.status === "draft").length} drafts`, icon: FileText },
    { label: "Articles", value: articleRows.length, detail: `${articleRows.filter((row) => row.status === "published").length} published · ${articleRows.filter((row) => row.status === "draft").length} drafts`, icon: BookOpenText },
    { label: "Subjects", value: subjects.length, detail: `${subjects.filter((subject) => subject.is_active).length} active`, icon: Tags },
  ];

  return (
    <>
      <PageHeading title="Content dashboard" description="A concise view of Improism’s publishing library and the fastest paths to create something new." />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => <section key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-zinc-600">{card.label}</p><span className="grid size-9 place-items-center rounded-xl bg-zinc-100"><card.icon className="size-4.5" /></span></div>
          <p className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{card.value}</p>
          <p className="mt-1 text-xs text-zinc-500">{card.detail}</p>
        </section>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Content by subject</h2><p className="mt-1 text-xs text-zinc-500">Posts and articles, including drafts and archives</p></div></div>
          <div className="divide-y divide-zinc-100">
            {subjects.map((subject) => {
              const subjectRows = rows.filter((row) => row.subject_id === subject.id);
              const postCount = subjectRows.filter((row) => !hasArticle(row.articles)).length;
              const articleCount = subjectRows.filter((row) => hasArticle(row.articles)).length;
              return <div key={subject.id} className="flex items-center justify-between gap-4 py-3.5">
                <div><p className="text-sm font-medium">{subject.name}</p><p className="mt-0.5 text-xs text-zinc-500">{postCount} posts · {articleCount} articles</p></div>
                <span className="text-sm font-semibold tabular-nums">{postCount + articleCount}</span>
              </div>;
            })}
            {!subjects.length && <p className="py-8 text-center text-sm text-zinc-500">Create a subject to start publishing.</p>}
          </div>
        </section>
        <section className="rounded-2xl bg-zinc-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Quick actions</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">What would you like to publish?</h2>
          <div className="mt-6 space-y-3">
            <Link href="/admin/posts/new" className="flex items-center justify-between rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black">Create a post <ArrowRight className="size-4" /></Link>
            <Link href="/admin/articles/new" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 text-sm font-semibold hover:bg-white/15">Write an article <ArrowRight className="size-4" /></Link>
            <Link href="/admin/subjects/new" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 text-sm font-semibold hover:bg-white/15">Add a subject <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </div>
    </>
  );
}
