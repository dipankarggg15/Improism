import { Archive, Eye, Pencil, Search } from "lucide-react";
import Link from "next/link";
import { setContentStatus } from "@/app/admin/actions";
import { PageHeading, StatusBadge } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

type ArticleRow = {
  id: string; post_id: string; reading_minutes: number;
  posts: { id: string; title: string; status: string; updated_at: string; subjects: { id: string; name: string } | null } | null;
};

export default async function ArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.toLowerCase() : "";
  const status = typeof query.status === "string" ? query.status : "all";
  const subjectId = typeof query.subject === "string" ? query.subject : "all";
  const { supabase } = await requireAdmin();
  const [{ data: rawArticles }, { data: subjects }] = await Promise.all([
    supabase.from("articles").select("id, post_id, reading_minutes, posts(id, title, status, updated_at, subjects(id, name))").order("updated_at", { referencedTable: "posts", ascending: false }),
    supabase.from("subjects").select("id, name").order("name"),
  ]);
  const articles = (rawArticles as unknown as ArticleRow[] ?? []).filter((article) => {
    const post = article.posts;
    return post && (!q || post.title.toLowerCase().includes(q)) && (status === "all" || post.status === status) && (subjectId === "all" || post.subjects?.id === subjectId);
  });
  return <>
    <PageHeading title="Articles" description="Manage long-form, formatted ideas and their publication lifecycle." action={{ href: "/admin/articles/new", label: "New article" }} />
    <form className="mb-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_200px_auto]">
      <label className="relative"><Search className="absolute left-3 top-3.5 size-4 text-zinc-400" /><input name="q" defaultValue={typeof query.q === "string" ? query.q : ""} placeholder="Search articles" className="admin-input pl-9" /></label>
      <select name="status" defaultValue={status} className="admin-input"><option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option></select>
      <select name="subject" defaultValue={subjectId} className="admin-input"><option value="all">All subjects</option>{(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
      <button className="rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white">Filter</button>
    </form>
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1fr)_160px_120px_150px] gap-4 border-b bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid"><span>Article</span><span>Subject</span><span>Status</span><span className="text-right">Actions</span></div>
      <div className="divide-y divide-zinc-100">
        {articles.map((article) => { const post = article.posts!; return <div key={article.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_120px_150px] md:items-center">
          <div><p className="truncate text-sm font-semibold">{post.title}</p><p className="mt-1 text-xs text-zinc-400">{article.reading_minutes} min read · Updated {new Date(post.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
          <p className="text-sm text-zinc-600">{post.subjects?.name}</p><div><StatusBadge status={post.status} /></div>
          <div className="flex justify-end gap-1">
            <Link href={`/admin/articles/${article.id}/preview`} title="Preview" className="grid size-9 place-items-center rounded-lg hover:bg-zinc-100"><Eye className="size-4" /></Link>
            <Link href={`/admin/articles/${article.id}/edit`} title="Edit" className="grid size-9 place-items-center rounded-lg hover:bg-zinc-100"><Pencil className="size-4" /></Link>
            <form action={setContentStatus}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="type" value="article" /><button name="status" value={post.status === "published" ? "draft" : "published"} className="h-9 rounded-lg px-2 text-xs font-semibold hover:bg-zinc-100">{post.status === "published" ? "Unpublish" : "Publish"}</button></form>
            {post.status !== "archived" && <form action={setContentStatus}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="type" value="article" /><button name="status" value="archived" title="Archive" className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"><Archive className="size-4" /></button></form>}
          </div>
        </div>; })}
        {!articles.length && <p className="px-5 py-14 text-center text-sm text-zinc-500">No articles match these filters.</p>}
      </div>
    </div>
  </>;
}
