import { saveArticle } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function NewArticlePage() {
  const { supabase } = await requireAdmin();
  const { data: subjects } = await supabase.from("subjects").select("id, name").eq("is_active", true).order("name");
  return <><PageHeading eyebrow="Articles" title="Write article" description="Use lightweight formatting, review the live preview, then save a draft or publish." /><ContentEditor kind="article" subjects={subjects ?? []} action={saveArticle} /></>;
}
