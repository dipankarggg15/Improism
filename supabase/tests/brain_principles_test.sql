begin;
select plan(8);

select has_table('public', 'brain_principles', 'Improism Brain principles table exists');
select col_is_pk('public', 'brain_principles', 'id', 'principles have stable UUID identifiers');
select has_column('public', 'brain_principles', 'principle_number', 'principles have an ordered number');
select has_column('public', 'brain_principles', 'title', 'principles have a title');
select has_column('public', 'brain_principles', 'content', 'principles have formatted content');
select has_column('public', 'brain_principles', 'updated_at', 'principle updates are timestamped');

select policies_are(
  'public',
  'brain_principles',
  array[
    'brain_principles_admin_select',
    'brain_principles_admin_insert',
    'brain_principles_admin_update',
    'brain_principles_admin_delete'
  ],
  'all principle access is governed by admin-only RLS policies'
);

select col_is_unique(
  'public',
  'brain_principles',
  'principle_number',
  'principle numbers remain unambiguous in the ordered book'
);

select * from finish();
rollback;
