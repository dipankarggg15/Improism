import { savePost } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function NewPostPage() {
  const { supabase } = await requireAdmin();
  const { data: subjects } = await supabase.from("subjects").select("id, name").eq("is_active", true).order("name");
  return <><PageHeading eyebrow="Posts" title="Create post" description="New posts begin as drafts unless you choose Publish." /><ContentEditor kind="post" subjects={subjects ?? []} action={savePost} /></>;
}
