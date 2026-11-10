"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { removeImage, uploadImage } from "@/lib/admin/media";
import {
  readingMinutes,
  sanitizeRichText,
  slugify,
  text,
  validateSubject,
  validateTitle,
  type ContentStatus,
} from "@/lib/admin/validation";

export type AdminActionState = { error?: string };

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof assertAdmin>>["supabase"],
  title: string,
) {
  const base = slugify(title) || "untitled";
  const { data } = await supabase.from("posts").select("slug").like("slug", `${base}%`);
  const existing = new Set((data ?? []).map((row) => row.slug));
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function desiredStatus(formData: FormData): ContentStatus {
  const value = text(formData.get("status"));
  return value === "published" ? "published" : "draft";
}

export async function savePost(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase, user } = await assertAdmin();
    const id = text(formData.get("id")) || crypto.randomUUID();
    const title = text(formData.get("title"));
    const subjectId = text(formData.get("subjectId"));
    const body = text(formData.get("body"));
    const titleError = validateTitle(title);
    const subjectError = validateSubject(subjectId);
    if (titleError || subjectError) return { error: titleError ?? subjectError };
    if (!body || body.length > 10000) return { error: "Body must be between 1 and 10,000 characters." };

    const status = desiredStatus(formData);
    const existingId = text(formData.get("id"));
    const { data: existing } = existingId
      ? await supabase.from("posts").select("slug, image_path, image_url").eq("id", id).single()
      : { data: null };
    if (existingId && !existing) return { error: "Post not found." };

    const file = formData.get("image");
    let image = { imagePath: existing?.image_path ?? null, imageUrl: existing?.image_url ?? null };
    if (file instanceof File && file.size > 0) {
      image = await uploadImage(supabase, file, "posts", id);
    } else if (formData.get("removeImage") === "on") {
      image = { imagePath: null, imageUrl: null };
    }

    const payload = {
      id,
      subject_id: subjectId,
      slug: existing?.slug ?? await uniqueSlug(supabase, title),
      title,
      excerpt: body.slice(0, 600),
      body,
      image_url: image.imageUrl,
      image_path: image.imagePath,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      created_by: user.id,
    };
    const result = existingId
      ? await supabase.from("posts").update(payload).eq("id", id)
      : await supabase.from("posts").insert(payload);
    if (result.error) {
      if (image.imagePath && image.imagePath !== existing?.image_path) await removeImage(supabase, image.imagePath);
      return { error: result.error.message };
    }
    if (existing?.image_path && existing.image_path !== image.imagePath) {
      await removeImage(supabase, existing.image_path);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the post." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?saved=1");
}

export async function saveArticle(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase, user } = await assertAdmin();
    const postId = text(formData.get("postId")) || crypto.randomUUID();
    const articleId = text(formData.get("articleId")) || crypto.randomUUID();
    const title = text(formData.get("title"));
    const subjectId = text(formData.get("subjectId"));
    const body = sanitizeRichText(text(formData.get("body")));
    const titleError = validateTitle(title);
    const subjectError = validateSubject(subjectId);
    if (titleError || subjectError) return { error: titleError ?? subjectError };
    if (body.replace(/<[^>]+>/g, "").trim().length < 1) return { error: "Add article body content." };
    if (body.length > 100000) return { error: "Article body is too long." };

    const status = desiredStatus(formData);
    const existingPostId = text(formData.get("postId"));
    const { data: existing } = existingPostId
      ? await supabase.from("posts").select("slug, image_path, image_url").eq("id", postId).single()
      : { data: null };
    if (existingPostId && !existing) return { error: "Article not found." };

    const file = formData.get("image");
    let image = { imagePath: existing?.image_path ?? null, imageUrl: existing?.image_url ?? null };
    if (file instanceof File && file.size > 0) {
      image = await uploadImage(supabase, file, "articles", postId);
    } else if (formData.get("removeImage") === "on") {
      image = { imagePath: null, imageUrl: null };
    }

    const postPayload = {
      id: postId,
      subject_id: subjectId,
      slug: existing?.slug ?? await uniqueSlug(supabase, title),
      title,
      excerpt: body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600),
      image_url: image.imageUrl,
      image_path: image.imagePath,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      created_by: user.id,
    };
    const postResult = existingPostId
      ? await supabase.from("posts").update(postPayload).eq("id", postId)
      : await supabase.from("posts").insert(postPayload);
    if (postResult.error) {
      if (image.imagePath && image.imagePath !== existing?.image_path) await removeImage(supabase, image.imagePath);
      return { error: postResult.error.message };
    }

    const articlePayload = { id: articleId, post_id: postId, body, reading_minutes: readingMinutes(body) };
    const articleResult = existingPostId
      ? await supabase.from("articles").update(articlePayload).eq("post_id", postId)
      : await supabase.from("articles").insert(articlePayload);
    if (articleResult.error) {
      if (!existingPostId) await supabase.from("posts").delete().eq("id", postId);
      return { error: articleResult.error.message };
    }
    if (existing?.image_path && existing.image_path !== image.imagePath) {
      await removeImage(supabase, existing.image_path);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the article." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?saved=1");
}

export async function setContentStatus(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = text(formData.get("id"));
  const type = text(formData.get("type")) === "article" ? "articles" : "posts";
  const requested = text(formData.get("status"));
  const status: ContentStatus = ["draft", "published", "archived"].includes(requested)
    ? requested as ContentStatus
    : "draft";
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid content item.");
  const { error } = await supabase.from("posts").update({
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/${type}`);
  redirect(`/admin/${type}?updated=1`);
}

export async function saveSubject(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase } = await assertAdmin();
    const id = text(formData.get("id")) || crypto.randomUUID();
    const existingId = text(formData.get("id"));
    const name = text(formData.get("name"));
    const description = text(formData.get("description"));
    if (name.length < 2 || name.length > 80) return { error: "Name must be between 2 and 80 characters." };
    if (description.length > 300) return { error: "Description must be 300 characters or fewer." };
    const { data: existing } = existingId
      ? await supabase.from("subjects").select("slug, image_path, image_url").eq("id", id).single()
      : { data: null };

    const file = formData.get("image");
    let image = { imagePath: existing?.image_path ?? null, imageUrl: existing?.image_url ?? null };
    if (file instanceof File && file.size > 0) image = await uploadImage(supabase, file, "subjects", id);
    else if (formData.get("removeImage") === "on") image = { imagePath: null, imageUrl: null };

    const payload = {
      id,
      slug: existing?.slug ?? slugify(name),
      name,
      description,
      is_active: formData.get("isActive") === "on",
      image_url: image.imageUrl,
      image_path: image.imagePath,
    };
    const result = existingId
      ? await supabase.from("subjects").update(payload).eq("id", id)
      : await supabase.from("subjects").insert(payload);
    if (result.error) return { error: result.error.message };
    if (existing?.image_path && existing.image_path !== image.imagePath) await removeImage(supabase, existing.image_path);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the subject." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects?saved=1");
}

export async function saveBrainPrinciple(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let savedId = "";
  try {
    const { supabase, user } = await assertAdmin();
    const existingId = text(formData.get("id"));
    const id = existingId || crypto.randomUUID();
    const numberValue = text(formData.get("principleNumber"));
    const principleNumber = Number(numberValue);
    const title = text(formData.get("title"));
    const content = sanitizeRichText(text(formData.get("content")));
    const plainContent = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (!Number.isInteger(principleNumber) || principleNumber < 1 || principleNumber > 9999) {
      return { error: "Principle number must be a whole number between 1 and 9,999." };
    }
    const titleError = validateTitle(title);
    if (titleError) return { error: titleError };
    if (!plainContent) return { error: "Add content for this principle." };
    if (content.length > 100000) return { error: "Principle content must be 100,000 characters or fewer." };
    if (existingId && !/^[0-9a-f-]{36}$/i.test(existingId)) return { error: "Invalid principle." };

    if (existingId) {
      const { data: existing, error: findError } = await supabase
        .from("brain_principles")
        .select("id")
        .eq("id", existingId)
        .single();
      if (findError || !existing) return { error: "Principle not found." };
    }

    const payload = {
      principle_number: principleNumber,
      title,
      content,
    };
    const result = existingId
      ? await supabase.from("brain_principles").update(payload).eq("id", id)
      : await supabase.from("brain_principles").insert({ id, ...payload, created_by: user.id });
    if (result.error) {
      if (result.error.code === "23505") return { error: `Principle ${principleNumber} already exists.` };
      return { error: result.error.message };
    }
    savedId = id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the principle." };
  }

  revalidatePath("/admin/brain");
  redirect(`/admin/brain?saved=1#principle-${savedId}`);
}

export async function deleteBrainPrinciple(formData: FormData) {
  const { supabase } = await assertAdmin();
  const id = text(formData.get("id"));
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid principle.");
  const { error } = await supabase.from("brain_principles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/brain");
  redirect("/admin/brain?deleted=1");
}
