import type { SupabaseClient } from "@supabase/supabase-js";

const bucket = "content-images";
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  folder: "posts" | "articles" | "subjects",
  ownerId: string,
) {
  if (!acceptedTypes.has(file.type)) throw new Error("Use a JPG, PNG, WebP, or GIF image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { imagePath: path, imageUrl: data.publicUrl };
}

export async function removeImage(supabase: SupabaseClient, path?: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
