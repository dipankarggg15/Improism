begin;
select plan(18);

select has_column('public', 'profiles', 'theme', 'profiles stores theme');
select has_column('public', 'profiles', 'notification_daily', 'profiles stores feed notification preference');
select has_column('public', 'profiles', 'personalization_enabled', 'profiles stores privacy preference');
select has_table('public', 'journeys', 'journeys table exists');
select has_table('public', 'journey_activities', 'journey activities table exists');
select has_table('public', 'journey_completions', 'journey completions table exists');
select has_table('public', 'journey_reflections', 'journey reflections table exists');
select has_table('public', 'feedback', 'feedback table exists');
select has_index('public', 'journeys', 'journeys_user_updated_idx', 'journeys are indexed by user');
select has_index('public', 'journey_activities', 'journey_activities_journey_position_idx', 'activities are ordered efficiently');
select has_index('public', 'journey_completions', 'journey_completions_user_date_idx', 'completions are indexed by date');
select has_function('public', 'delete_my_account', array[]::text[], 'self-delete function exists');
select table_privs_are('public', 'journeys', 'authenticated', array['DELETE', 'INSERT', 'SELECT', 'UPDATE'], 'authenticated journey privileges are scoped by RLS');
select table_privs_are('public', 'feedback', 'authenticated', array['DELETE', 'INSERT', 'SELECT'], 'feedback privileges are constrained by RLS');
select policies_are('public', 'journeys', array['journeys_own_all'], 'journeys have an ownership policy');
select policies_are('public', 'journey_activities', array['journey_activities_own_all'], 'activities have an ownership policy');
select policies_are('public', 'journey_completions', array['journey_completions_own_all'], 'completions have an ownership policy');
select policies_are('public', 'journey_reflections', array['journey_reflections_own_all'], 'reflections have an ownership policy');

select * from finish();
rollback;
