begin;
select plan(8);

select has_table('public', 'ai_rules', 'AI Rules table exists');
select col_is_pk('public', 'ai_rules', 'id', 'AI rules have stable UUID identifiers');
select has_column('public', 'ai_rules', 'rule_number', 'AI rules have an ordered number');
select has_column('public', 'ai_rules', 'title', 'AI rules have a title');
select has_column('public', 'ai_rules', 'content', 'AI rules have formatted content');
select has_column('public', 'ai_rules', 'updated_at', 'AI rule updates are timestamped');

select policies_are(
  'public',
  'ai_rules',
  array[
    'ai_rules_admin_select',
    'ai_rules_admin_insert',
    'ai_rules_admin_update',
    'ai_rules_admin_delete'
  ],
  'all AI rule access is governed by admin-only RLS policies'
);

select col_is_unique('public', 'ai_rules', 'rule_number', 'AI rule numbers remain unambiguous');

select * from finish();
rollback;
