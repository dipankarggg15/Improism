-- Complete the non-AI member experience with persistent preferences, journeys,
-- feedback, and safe self-service account deletion.

alter table public.profiles
  add column if not exists theme text not null default 'System'
    check (theme in ('Light', 'Dark', 'System')),
  add column if not exists notification_daily boolean not null default true,
  add column if not exists notification_journeys boolean not null default true,
  add column if not exists notification_reflections boolean not null default false,
  add column if not exists personalization_enabled boolean not null default true;

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '' check (char_length(description) <= 1000),
  goal text not null check (char_length(goal) between 3 and 1000),
  kind text not null check (kind in ('measurable', 'ongoing')),
  target_current integer check (target_current is null or target_current >= 0),
  target_total integer check (target_total is null or target_total > 0),
  target_unit text check (target_unit is null or char_length(target_unit) between 1 and 40),
  deadline date,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug),
  check (
    (kind = 'ongoing' and target_current is null and target_total is null and target_unit is null)
    or
    (kind = 'measurable' and target_current is not null and target_total is not null and target_unit is not null)
  )
);

create table public.journey_activities (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  frequency text not null check (char_length(frequency) between 1 and 80),
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journey_completions (
  activity_id uuid not null references public.journey_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completion_date date not null,
  created_at timestamptz not null default now(),
  primary key (activity_id, completion_date)
);

create table public.journey_reflections (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  reflected_on date not null,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 3 and 5000),
  page_path text not null default '' check (char_length(page_path) <= 500),
  created_at timestamptz not null default now()
);

create index journeys_user_updated_idx on public.journeys(user_id, updated_at desc);
create index journey_activities_journey_position_idx on public.journey_activities(journey_id, position);
create index journey_completions_user_date_idx on public.journey_completions(user_id, completion_date desc);
create index journey_reflections_journey_date_idx on public.journey_reflections(journey_id, reflected_on desc, created_at desc);
create index feedback_user_created_idx on public.feedback(user_id, created_at desc);

create trigger journeys_set_updated_at before update on public.journeys
for each row execute function public.set_updated_at();
create trigger journey_activities_set_updated_at before update on public.journey_activities
for each row execute function public.set_updated_at();

alter table public.journeys enable row level security;
alter table public.journey_activities enable row level security;
alter table public.journey_completions enable row level security;
alter table public.journey_reflections enable row level security;
alter table public.feedback enable row level security;

revoke all on table public.journeys, public.journey_activities,
  public.journey_completions, public.journey_reflections, public.feedback
from anon, authenticated;

grant select, insert, update, delete on table public.journeys,
  public.journey_activities, public.journey_completions, public.journey_reflections
to authenticated;
grant insert on table public.feedback to authenticated;

create policy "journeys_own_all" on public.journeys
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "journey_activities_own_all" on public.journey_activities
for all to authenticated
using (exists (
  select 1 from public.journeys j
  where j.id = journey_id and j.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.journeys j
  where j.id = journey_id and j.user_id = (select auth.uid())
));

create policy "journey_completions_own_all" on public.journey_completions
for all to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.journey_activities a
    join public.journeys j on j.id = a.journey_id
    where a.id = activity_id and j.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.journey_activities a
    join public.journeys j on j.id = a.journey_id
    where a.id = activity_id and j.user_id = (select auth.uid())
  )
);

create policy "journey_reflections_own_all" on public.journey_reflections
for all to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.journeys j
    where j.id = journey_id and j.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.journeys j
    where j.id = journey_id and j.user_id = (select auth.uid())
  )
);

create policy "feedback_own_insert" on public.feedback
for insert to authenticated
with check (user_id = (select auth.uid()));

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
