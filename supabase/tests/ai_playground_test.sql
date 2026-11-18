begin;
select plan(19);

select has_table('public', 'ai_test_conversations', 'test conversations table exists');
select has_table('public', 'ai_test_messages', 'test messages table exists');
select has_table('public', 'ai_test_feedback', 'test feedback table exists');
select col_is_fk('public', 'ai_test_messages', 'conversation_id', 'messages belong to conversations');
select col_is_fk('public', 'ai_test_feedback', 'message_id', 'feedback belongs to a response');
select col_is_unique('public', 'ai_test_feedback', 'message_id', 'one feedback record exists per response');
select has_column('public', 'ai_test_messages', 'governing_documents', 'responses record supplied Brain documents');
select has_column('public', 'ai_test_messages', 'model', 'responses record their model');
select has_column('public', 'ai_test_messages', 'total_tokens', 'responses record token usage');
select has_column('public', 'ai_test_messages', 'cached_input_tokens', 'responses record cached input tokens');
select has_column('public', 'ai_test_messages', 'cache_write_tokens', 'responses record cache writes');
select has_column('public', 'ai_test_messages', 'reasoning_tokens', 'responses record reasoning tokens');
select has_column('public', 'ai_test_messages', 'reasoning_effort', 'responses record reasoning effort');
select has_column('public', 'ai_test_messages', 'total_duration_ms', 'responses record total duration');
select has_column('public', 'ai_test_messages', 'brain_load_ms', 'responses record Brain loading duration');
select has_column('public', 'ai_test_messages', 'first_token_ms', 'responses record time to first text');
select has_column('public', 'ai_test_messages', 'completion_ms', 'responses record OpenAI completion duration');
select has_function('public', 'get_ai_governing_documents', array[]::text[], 'ordered governing document query exists');
select policies_are(
  'public',
  'ai_test_conversations',
  array[
    'ai_test_conversations_admin_select',
    'ai_test_conversations_admin_insert',
    'ai_test_conversations_admin_update',
    'ai_test_conversations_admin_delete'
  ],
  'conversation access is admin-only'
);

select * from finish();
rollback;
