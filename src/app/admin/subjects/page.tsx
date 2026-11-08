import { Pencil } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function SubjectsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: subjects }, { data: posts }] = await Promise.all([
    supabase.from("subjects").select("id, name, description, is_active, image_url").order("name"),
    supabase.from("posts").select("id, subject_id, articles(id)"),
  ]);
  return <>
    <PageHeading title="Subjects" description="Organize the library and control which topics are available throughout Improism." action={{ href: "/admin/subjects/new", label: "New subject" }} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(subjects ?? []).map((subject) => {
        const assigned = (posts ?? []).filter((post) => post.subject_id === subject.id);
        const articleCount = assigned.filter((post) => Array.isArray(post.articles) ? post.articles.length > 0 : Boolean(post.articles)).length;
        return <section key={subject.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {subject.image_url ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={subject.image_url} alt="" className="h-28 w-full object-cover" />
          </> : <div className="h-28 bg-gradient-to-br from-zinc-900 to-zinc-600" />}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{subject.name}</h2><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${subject.is_active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{subject.is_active ? "Active" : "Inactive"}</span></div><Link href={`/admin/subjects/${subject.id}/edit`} className="grid size-9 place-items-center rounded-lg border border-zinc-200 hover:bg-zinc-50" title="Edit subject"><Pencil className="size-4" /></Link></div>
            <p className="mt-4 min-h-10 text-sm leading-5 text-zinc-600">{subject.description || "No description yet."}</p>
            <div className="mt-5 flex gap-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500"><span><b className="text-zinc-900">{assigned.length - articleCount}</b> posts</span><span><b className="text-zinc-900">{articleCount}</b> articles</span></div>
          </div>
        </section>;
      })}
    </div>
  </>;
}
