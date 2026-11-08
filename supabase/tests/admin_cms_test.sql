begin;
select plan(12);

select has_column('public', 'posts', 'body', 'posts have body content');
select has_column('public', 'posts', 'image_url', 'posts have a public image URL');
select has_column('public', 'posts', 'image_path', 'posts retain the storage object path');
select has_column('public', 'subjects', 'image_url', 'subjects support images');

select policies_are(
  'storage',
  'objects',
  array[
    'content_images_public_read',
    'content_images_admin_insert',
    'content_images_admin_update',
    'content_images_admin_delete'
  ],
  'content storage policies are installed'
);

select has_function('public', 'is_admin', array[]::text[], 'admin authorization function exists');
select function_privs_are('public', 'is_admin', array[]::text[], 'authenticated', array['EXECUTE'], 'authenticated users may check admin status');

select policies_are('public', 'subjects', array[
  'subjects_read_active_or_admin', 'subjects_admin_insert', 'subjects_admin_update', 'subjects_admin_delete'
]);
select policies_are('public', 'posts', array[
  'posts_read_published_or_admin', 'posts_admin_insert', 'posts_admin_update', 'posts_admin_delete'
]);
select policies_are('public', 'articles', array[
  'articles_read_for_published_posts_or_admin', 'articles_admin_insert', 'articles_admin_update', 'articles_admin_delete'
]);

select col_is_fk('public', 'posts', 'subject_id', 'post-subject relationship remains enforced');
select col_is_fk('public', 'articles', 'post_id', 'article-post relationship remains enforced');

select * from finish();
rollback;
