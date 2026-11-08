-- Admin CMS fields and image storage. Existing content relationships stay intact:
-- articles continue to extend their one-to-one posts row.

alter table public.posts
  add column if not exists body text not null default '',
  add column if not exists image_url text,
  add column if not exists image_path text;

alter table public.subjects
  add column if not exists image_url text,
  add column if not exists image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "content_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'content-images');

create policy "content_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'content-images' and (select public.is_admin()));

create policy "content_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'content-images' and (select public.is_admin()))
with check (bucket_id = 'content-images' and (select public.is_admin()));

create policy "content_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'content-images' and (select public.is_admin()));
