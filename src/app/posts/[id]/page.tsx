import { notFound, redirect } from "next/navigation";
import { PublicContentPage } from "@/components/public-content-page";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type PostRow = {
  id: string; slug: string; title: string; body: string; excerpt: string; image_url: string | null;
  published_at: string; subjects: { name: string } | null; articles: Array<{ id: string }> | null;
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await (await createClient()).from("posts")
    .select("id, slug, title, body, excerpt, image_url, published_at, subjects(name), articles(id)")
    .eq("id", id).eq("status", "published").single();
  const post = data as unknown as PostRow | null;
  if (!post) notFound();
  if (post.articles?.length) redirect(`/articles/${post.slug}`);
  const body = post.body || post.excerpt;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return <PublicContentPage kind="Post" id={post.id} title={post.title} subject={post.subjects?.name ?? "Improism"} body={body} imageUrl={post.image_url} readingMinutes={Math.max(1, Math.ceil(words / 220))} publishedAt={post.published_at} rich={false} />;
}
