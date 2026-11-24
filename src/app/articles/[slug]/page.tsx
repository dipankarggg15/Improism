import { notFound } from "next/navigation";
import { PublicContentPage } from "@/components/public-content-page";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type ArticleRow = {
  id: string; body: string; reading_minutes: number;
  posts: { id: string; slug: string; title: string; image_url: string | null; published_at: string; subjects: { name: string } | null } | null;
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await (await createClient()).from("articles")
    .select("id, body, reading_minutes, posts!inner(id, slug, title, image_url, published_at, status, subjects(name))")
    .eq("posts.slug", slug).eq("posts.status", "published").single();
  const article = data as unknown as ArticleRow | null;
  if (!article?.posts) notFound();
  return <PublicContentPage kind="Article" id={article.posts.id} slug={article.posts.slug} title={article.posts.title} subject={article.posts.subjects?.name ?? "Improism"} body={article.body} imageUrl={article.posts.image_url} readingMinutes={article.reading_minutes} publishedAt={article.posts.published_at} rich />;
}
