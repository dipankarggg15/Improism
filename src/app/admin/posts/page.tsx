import { Archive, Eye, Pencil, Search } from "lucide-react";
import Link from "next/link";
import { setContentStatus } from "@/app/admin/actions";
import { PageHeading, StatusBadge } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function PostsPage({ searchParams }: PageProps<"/admin/posts">) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.toLowerCase() : "";
  const status = typeof query.status === "string" ? query.status : "all";
  const subjectId = typeof query.subject === "string" ? query.subject : "all";
  const { supabase } = await requireAdmin();
  const [{ data: rawPosts }, { data: subjects }] = await Promise.all([
    supabase.from("posts").select("id, title, status, updated_at, published_at, subjects(id, name), articles(id)").order("updated_at", { ascending: false }),
    supabase.from("subjects").select("id, name").order("name"),
  ]);
  const posts = (rawPosts ?? []).filter((post) => {
    const article = Array.isArray(post.articles) ? post.articles.length > 0 : Boolean(post.articles);
    const subject = post.subjects as unknown as { id: string; name: string } | null;
    return !article && (!q || post.title.toLowerCase().includes(q)) && (status === "all" || post.status === status) && (subjectId === "all" || subject?.id === subjectId);
  });
  return <>
    <PageHeading title="Posts" description="Create short-form feed content, review drafts, and control publication status." action={{ href: "/admin/posts/new", label: "New post" }} />
    <form className="mb-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_200px_auto]">
      <label className="relative"><Search className="absolute left-3 top-3.5 size-4 text-zinc-400" /><input name="q" defaultValue={typeof query.q === "string" ? query.q : ""} placeholder="Search posts" className="admin-input pl-9" /></label>
      <select name="status" defaultValue={status} className="admin-input"><option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option></select>
      <select name="subject" defaultValue={subjectId} className="admin-input"><option value="all">All subjects</option>{(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
      <button className="rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white">Filter</button>
    </form>
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1fr)_160px_120px_150px] gap-4 border-b bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid"><span>Post</span><span>Subject</span><span>Status</span><span className="text-right">Actions</span></div>
      <div className="divide-y divide-zinc-100">
        {posts.map((post) => { const subject = post.subjects as unknown as { name: string } | null; return <div key={post.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_120px_150px] md:items-center">
          <div><p className="truncate text-sm font-semibold">{post.title}</p><p className="mt-1 text-xs text-zinc-400">Updated {new Date(post.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
          <p className="text-sm text-zinc-600">{subject?.name}</p><div><StatusBadge status={post.status} /></div>
          <div className="flex justify-end gap-1">
            <Link href={`/admin/posts/${post.id}/preview`} title="Preview" className="grid size-9 place-items-center rounded-lg hover:bg-zinc-100"><Eye className="size-4" /></Link>
            <Link href={`/admin/posts/${post.id}/edit`} title="Edit" className="grid size-9 place-items-center rounded-lg hover:bg-zinc-100"><Pencil className="size-4" /></Link>
            <form action={setContentStatus}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="type" value="post" /><button name="status" value={post.status === "published" ? "draft" : "published"} title={post.status === "published" ? "Unpublish" : "Publish"} className="h-9 rounded-lg px-2 text-xs font-semibold hover:bg-zinc-100">{post.status === "published" ? "Unpublish" : "Publish"}</button></form>
            {post.status !== "archived" && <form action={setContentStatus}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="type" value="post" /><button name="status" value="archived" title="Archive" className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"><Archive className="size-4" /></button></form>}
          </div>
        </div>; })}
        {!posts.length && <p className="px-5 py-14 text-center text-sm text-zinc-500">No posts match these filters.</p>}
      </div>
    </div>
  </>;
}
