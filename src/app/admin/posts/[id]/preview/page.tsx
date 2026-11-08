import { notFound } from "next/navigation";
import { ContentPreview } from "@/components/admin/content-preview";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function PostPreviewPage({ params }: PageProps<"/admin/posts/[id]/preview">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase.from("posts").select("id, title, body, image_url, status, subjects(name), articles(id)").eq("id", id).single();
  if (!post || (Array.isArray(post.articles) ? post.articles.length : post.articles)) notFound();
  const subject = post.subjects as unknown as { name: string } | null;
  return <ContentPreview kind="Post" editHref={`/admin/posts/${post.id}/edit`} title={post.title} body={post.body} imageUrl={post.image_url} subject={subject?.name ?? "Unassigned"} status={post.status} />;
}
