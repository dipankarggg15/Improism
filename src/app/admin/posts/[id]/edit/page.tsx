import { notFound } from "next/navigation";
import { savePost } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]/edit">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: post }, { data: subjects }] = await Promise.all([
    supabase.from("posts").select("id, title, subject_id, body, image_url, status, articles(id)").eq("id", id).single(),
    supabase.from("subjects").select("id, name").order("name"),
  ]);
  const isArticle = post && (Array.isArray(post.articles) ? post.articles.length > 0 : Boolean(post.articles));
  if (!post || isArticle) notFound();
  return <><PageHeading eyebrow="Posts" title="Edit post" description="Changes are validated and saved through the protected admin service." /><ContentEditor kind="post" subjects={subjects ?? []} action={savePost} initial={{ id: post.id, title: post.title, subjectId: post.subject_id, body: post.body, imageUrl: post.image_url, status: post.status }} /></>;
}
