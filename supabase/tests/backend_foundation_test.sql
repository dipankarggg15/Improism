begin;
select plan(12);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'subjects', 'subjects exists');
select has_table('public', 'user_subjects', 'user_subjects exists');
select has_table('public', 'posts', 'posts exists');
select has_table('public', 'articles', 'articles exists');
select has_table('public', 'saved_posts', 'saved_posts exists');

select policies_are('public', 'profiles', array['profiles_select_own_or_admin', 'profiles_update_own_or_admin']);
select policies_are('public', 'user_subjects', array['user_subjects_select_own', 'user_subjects_insert_own', 'user_subjects_delete_own']);
select policies_are('public', 'saved_posts', array['saved_posts_select_own', 'saved_posts_insert_own', 'saved_posts_delete_own']);

select col_is_pk('public', 'profiles', 'id', 'profiles are keyed to auth users');
select col_is_pk('public', 'user_subjects', array['user_id', 'subject_id'], 'subject selections are unique');
select col_is_pk('public', 'saved_posts', array['user_id', 'post_id'], 'saved posts are unique');

select * from finish();
rollback;
