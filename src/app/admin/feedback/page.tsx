import { MessageSquareText } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

type FeedbackRow = {
  id: string;
  message: string;
  page_path: string;
  created_at: string;
  profiles: { display_name: string } | null;
};

export default async function AdminFeedbackPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("feedback")
    .select("id, message, page_path, created_at, profiles(display_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as FeedbackRow[];
  return <>
    <PageHeading title="Feedback" description="Review feedback submitted by signed-in Improism members." />
    <div className="space-y-4">
      {rows.map((item) => <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-zinc-100"><MessageSquareText className="size-4" /></span><div><p className="text-sm font-semibold">{item.profiles?.display_name || "Improism member"}</p><p className="mt-0.5 text-xs text-zinc-400">{new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
          {item.page_path && <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">{item.page_path}</span>}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{item.message}</p>
      </article>)}
      {!rows.length && <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-14 text-center text-sm text-zinc-500">No feedback has been submitted yet.</div>}
    </div>
  </>;
}
