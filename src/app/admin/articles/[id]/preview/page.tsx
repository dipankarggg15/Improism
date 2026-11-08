import { notFound } from "next/navigation";
import { ContentPreview } from "@/components/admin/content-preview";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

type Article = { id: string; body: string; posts: { id: string; title: string; image_url: string | null; status: string; subjects: { name: string } | null } | null };

export default async function ArticlePreviewPage({ params }: PageProps<"/admin/articles/[id]/preview">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("articles").select("id, body, posts(id, title, image_url, status, subjects(name))").eq("id", id).single();
  const article = data as unknown as Article | null;
  if (!article?.posts) notFound();
  return <ContentPreview kind="Article" editHref={`/admin/articles/${article.id}/edit`} title={article.posts.title} body={article.body} imageUrl={article.posts.image_url} subject={article.posts.subjects?.name ?? "Unassigned"} status={article.posts.status} rich />;
}
