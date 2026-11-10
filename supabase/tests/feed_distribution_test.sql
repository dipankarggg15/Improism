begin;
select plan(14);

select has_table('public', 'feed_states', 'compact per-user, per-subject feed state exists');
select has_column('public', 'profiles', 'timezone', 'profiles store the feed reset timezone');
select has_column('public', 'feed_states', 'cycle_viewed_post_ids', 'cycle views are stored compactly');
select has_column('public', 'feed_states', 'allocated_post_ids', 'the current allocation is stored compactly');
select has_column('public', 'feed_states', 'viewed_allocated_post_ids', 'allocation views are tracked without view rows');
select has_column('public', 'feed_states', 'daily_issued_count', 'the database enforces the daily issue count');

select col_is_pk(
  'public',
  'feed_states',
  array['user_id', 'subject_id'],
  'there is only one state row per user and subject'
);

select policies_are(
  'public',
  'feed_states',
  array['feed_states_select_own'],
  'users can only inspect their own feed state'
);

select table_privs_are(
  'public',
  'feed_states',
  'authenticated',
  array['SELECT'],
  'clients cannot insert, update, or delete feed state directly'
);

select has_function('public', 'get_my_daily_feed', array[]::text[], 'daily allocation RPC exists');
select has_function(
  'public',
  'mark_my_feed_posts_viewed',
  array['uuid[]'],
  'visibility tracking RPC exists'
);

select function_privs_are(
  'public',
  'get_my_daily_feed',
  array[]::text[],
  'authenticated',
  array['EXECUTE'],
  'only authenticated clients can request an allocation'
);

select function_privs_are(
  'public',
  'mark_my_feed_posts_viewed',
  array['uuid[]'],
  'authenticated',
  array['EXECUTE'],
  'only authenticated clients can mark allocated posts viewed'
);

select results_eq(
  $$ select count(*)::bigint from public.subjects where slug = 'mindfulness' and is_active $$,
  $$ values (1::bigint) $$,
  'the ninth main category is active'
);

select * from finish();
rollback;
