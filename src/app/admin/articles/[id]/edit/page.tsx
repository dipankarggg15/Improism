import { notFound } from "next/navigation";
import { saveArticle } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeading } from "@/components/admin/page-heading";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

type Article = { id: string; post_id: string; body: string; posts: { title: string; subject_id: string; image_url: string | null; status: string } | null };

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: rawArticle }, { data: subjects }] = await Promise.all([
    supabase.from("articles").select("id, post_id, body, posts(title, subject_id, image_url, status)").eq("id", id).single(),
    supabase.from("subjects").select("id, name").order("name"),
  ]);
  const article = rawArticle as unknown as Article | null;
  if (!article?.posts) notFound();
  return <><PageHeading eyebrow="Articles" title="Edit article" description="Update the story, cover, subject, and publication state." /><ContentEditor kind="article" subjects={subjects ?? []} action={saveArticle} initial={{ id: article.post_id, articleId: article.id, title: article.posts.title, subjectId: article.posts.subject_id, body: article.body, imageUrl: article.posts.image_url, status: article.posts.status }} /></>;
}
