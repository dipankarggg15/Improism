-- Personalized daily feed distribution.
-- State is compact: one row per user/subject, not one row per impression.

alter table public.profiles
  add column if not exists timezone text not null default 'Asia/Kolkata';

alter table public.profiles
  add constraint profiles_timezone_length_check
  check (char_length(timezone) between 1 and 64) not valid;

alter table public.profiles validate constraint profiles_timezone_length_check;

create or replace function public.validate_profile_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from pg_catalog.pg_timezone_names where name = new.timezone
  ) then
    raise exception 'Unknown timezone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_timezone
before insert or update of timezone on public.profiles
for each row execute function public.validate_profile_timezone();

create table public.feed_states (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  cycle integer not null default 1 check (cycle > 0),
  cycle_viewed_post_ids uuid[] not null default '{}',
  allocation_date date,
  allocated_post_ids uuid[] not null default '{}',
  viewed_allocated_post_ids uuid[] not null default '{}',
  daily_issued_count smallint not null default 0 check (daily_issued_count between 0 and 10),
  last_served_post_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id),
  check (cardinality(allocated_post_ids) <= 10),
  check (viewed_allocated_post_ids <@ allocated_post_ids)
);

create index feed_states_subject_id_idx on public.feed_states(subject_id);

create trigger feed_states_set_updated_at before update on public.feed_states
for each row execute function public.set_updated_at();

create or replace function public.prevent_active_day_timezone_shift()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.timezone is distinct from old.timezone
     and (pg_catalog.now() at time zone new.timezone)::date
         is distinct from (pg_catalog.now() at time zone old.timezone)::date
     and exists (
       select 1 from public.feed_states fs
       where fs.user_id = old.id
         and fs.allocation_date = (pg_catalog.now() at time zone old.timezone)::date
     ) then
    raise exception 'Timezone changes that cross a date boundary are available after the current feed day'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_active_day_timezone_shift
before update of timezone on public.profiles
for each row execute function public.prevent_active_day_timezone_shift();

alter table public.feed_states enable row level security;
revoke all on table public.feed_states from anon, authenticated;
grant select on table public.feed_states to authenticated;

create policy "feed_states_select_own"
on public.feed_states for select to authenticated
using ((select auth.uid()) = user_id);

-- Returns the authenticated user's existing allocation, creating exactly one
-- allocation per selected subject when the user first visits on a local day.
create or replace function public.get_my_daily_feed()
returns table (
  post_id uuid,
  subject_id uuid,
  subject_name text,
  title text,
  body text,
  excerpt text,
  image_url text,
  published_at timestamptz,
  allocation_date date,
  viewed boolean,
  saved boolean,
  category_position integer,
  feed_position integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_timezone text;
  v_local_date date;
  v_subject_id uuid;
  v_cycle integer;
  v_cycle_viewed uuid[];
  v_allocation_date date;
  v_allocated uuid[];
  v_viewed_allocated uuid[];
  v_daily_issued smallint;
  v_last_served uuid;
  v_current_posts uuid[];
  v_carry uuid[];
  v_candidates uuid[];
  v_slots integer;
  v_new_posts uuid[];
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select p.timezone into v_timezone
  from public.profiles p
  where p.id = v_user_id;

  if v_timezone is null then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  v_local_date := (pg_catalog.now() at time zone v_timezone)::date;

  -- UUID order is stable, so concurrent requests acquire category locks in the
  -- same order and cannot produce different allocations or deadlock.
  for v_subject_id in
    select us.subject_id
    from public.user_subjects us
    join public.subjects s on s.id = us.subject_id
    where us.user_id = v_user_id and s.is_active
    order by us.subject_id
  loop
    insert into public.feed_states (user_id, subject_id)
    values (v_user_id, v_subject_id)
    on conflict (user_id, subject_id) do nothing;

    select fs.cycle, fs.cycle_viewed_post_ids, fs.allocation_date,
           fs.allocated_post_ids, fs.viewed_allocated_post_ids,
           fs.daily_issued_count, fs.last_served_post_id
    into v_cycle, v_cycle_viewed, v_allocation_date, v_allocated,
         v_viewed_allocated, v_daily_issued, v_last_served
    from public.feed_states fs
    where fs.user_id = v_user_id and fs.subject_id = v_subject_id
    for update;

    select coalesce(array_agg(p.id order by
      case when p.id = v_last_served then 1 else 0 end,
      md5(v_user_id::text || ':' || v_subject_id::text || ':' || v_cycle::text || ':' || p.id::text)
    ), '{}'::uuid[])
    into v_current_posts
    from public.posts p
    where p.subject_id = v_subject_id
      and p.status = 'published'
      and p.published_at <= pg_catalog.now()
      and not exists (select 1 from public.articles a where a.post_id = p.id);

    -- Remove content that was unpublished, archived, or moved to another type.
    select coalesce(array_agg(x.id order by x.ordinality), '{}'::uuid[])
    into v_cycle_viewed
    from unnest(v_cycle_viewed) with ordinality as x(id, ordinality)
    where x.id = any(v_current_posts);

    select coalesce(array_agg(x.id order by x.ordinality), '{}'::uuid[])
    into v_allocated
    from unnest(v_allocated) with ordinality as x(id, ordinality)
    where x.id = any(v_current_posts);

    select coalesce(array_agg(x.id order by x.ordinality), '{}'::uuid[])
    into v_viewed_allocated
    from unnest(v_viewed_allocated) with ordinality as x(id, ordinality)
    where x.id = any(v_allocated);

    if v_allocation_date is distinct from v_local_date then
      -- Only unviewed content carries. There is no loop over missed dates.
      select coalesce(array_agg(x.id order by x.ordinality), '{}'::uuid[])
      into v_carry
      from unnest(v_allocated) with ordinality as x(id, ordinality)
      where not (x.id = any(v_viewed_allocated));

      v_allocated := v_carry;
      v_viewed_allocated := '{}'::uuid[];
      v_daily_issued := cardinality(v_carry)::smallint;
      v_allocation_date := v_local_date;

      -- A cycle changes only after every currently available post was viewed.
      if cardinality(v_current_posts) > 0
         and not exists (
           select 1 from unnest(v_current_posts) current_id
           where not (current_id = any(v_cycle_viewed))
         ) then
        v_cycle := v_cycle + 1;
        v_cycle_viewed := '{}'::uuid[];

        select coalesce(array_agg(p.id order by
          case when p.id = v_last_served then 1 else 0 end,
          md5(v_user_id::text || ':' || v_subject_id::text || ':' || v_cycle::text || ':' || p.id::text)
        ), '{}'::uuid[])
        into v_current_posts
        from public.posts p
        where p.subject_id = v_subject_id
          and p.status = 'published'
          and p.published_at <= pg_catalog.now()
          and not exists (select 1 from public.articles a where a.post_id = p.id);
      end if;

      v_slots := 10 - v_daily_issued;
      if v_slots > 0 then
        select coalesce(array_agg(candidate_id order by candidate_order), '{}'::uuid[])
        into v_candidates
        from (
          select current_id as candidate_id, ordinality as candidate_order
          from unnest(v_current_posts) with ordinality as current_post(current_id, ordinality)
          where not (current_id = any(v_cycle_viewed))
            and not (current_id = any(v_allocated))
          order by ordinality
          limit v_slots
        ) candidates;

        v_new_posts := v_candidates;
        v_allocated := v_allocated || v_new_posts;
        v_daily_issued := (v_daily_issued + cardinality(v_new_posts))::smallint;
        if cardinality(v_new_posts) > 0 then
          v_last_served := v_new_posts[cardinality(v_new_posts)];
        end if;
      end if;
    end if;

    update public.feed_states fs
    set cycle = v_cycle,
        cycle_viewed_post_ids = v_cycle_viewed,
        allocation_date = v_allocation_date,
        allocated_post_ids = v_allocated,
        viewed_allocated_post_ids = v_viewed_allocated,
        daily_issued_count = v_daily_issued,
        last_served_post_id = v_last_served
    where fs.user_id = v_user_id and fs.subject_id = v_subject_id;
  end loop;

  return query
  with allocated as (
    select fs.subject_id, fs.allocation_date, item.post_id,
           item.category_position::integer,
           item.post_id = any(fs.viewed_allocated_post_ids) as viewed
    from public.feed_states fs
    cross join lateral unnest(fs.allocated_post_ids) with ordinality
      as item(post_id, category_position)
    where fs.user_id = v_user_id
      and fs.allocation_date = v_local_date
      and exists (
        select 1 from public.user_subjects us
        where us.user_id = v_user_id and us.subject_id = fs.subject_id
      )
  ), visible as (
    select a.*, p.title, p.body, p.excerpt, p.image_url, p.published_at,
           s.name as subject_name,
           exists (
             select 1 from public.saved_posts sp
             where sp.user_id = v_user_id and sp.post_id = p.id
           ) as saved
    from allocated a
    join public.posts p on p.id = a.post_id
    join public.subjects s on s.id = a.subject_id
    where p.status = 'published' and p.published_at <= pg_catalog.now()
      and s.is_active
      and not exists (select 1 from public.articles ar where ar.post_id = p.id)
  )
  select v.post_id, v.subject_id, v.subject_name, v.title, v.body,
         v.excerpt, v.image_url, v.published_at, v.allocation_date,
         v.viewed, v.saved, v.category_position,
         row_number() over (
           order by md5(v_user_id::text || ':' || v.allocation_date::text || ':' || v.post_id::text)
         )::integer as feed_position
  from visible v
  order by feed_position;
end;
$$;

-- Idempotently records visibility for posts that were actually allocated.
create or replace function public.mark_my_feed_posts_viewed(p_post_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_subject_id uuid;
  v_valid_ids uuid[];
  v_marked integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_post_ids is null or cardinality(p_post_ids) = 0 then
    return 0;
  end if;
  if cardinality(p_post_ids) > 100 then
    raise exception 'At most 100 posts may be marked at once' using errcode = '22023';
  end if;

  for v_subject_id in
    select distinct fs.subject_id
    from public.feed_states fs
    where fs.user_id = v_user_id
      and fs.allocated_post_ids && p_post_ids
    order by fs.subject_id
  loop
    perform 1
    from public.feed_states fs
    where fs.user_id = v_user_id and fs.subject_id = v_subject_id
    for update;

    select coalesce(array_agg(distinct requested_id), '{}'::uuid[])
    into v_valid_ids
    from unnest(p_post_ids) as requested(requested_id)
    join public.feed_states fs
      on fs.user_id = v_user_id and fs.subject_id = v_subject_id
     and requested_id = any(fs.allocated_post_ids);

    update public.feed_states fs
    set cycle_viewed_post_ids = array(
          select distinct viewed_id
          from unnest(fs.cycle_viewed_post_ids || v_valid_ids) as viewed(viewed_id)
        ),
        viewed_allocated_post_ids = array(
          select distinct viewed_id
          from unnest(fs.viewed_allocated_post_ids || v_valid_ids) as viewed(viewed_id)
        )
    where fs.user_id = v_user_id and fs.subject_id = v_subject_id;

    v_marked := v_marked + cardinality(v_valid_ids);
  end loop;

  return v_marked;
end;
$$;

revoke all on function public.get_my_daily_feed() from public, anon;
revoke all on function public.mark_my_feed_posts_viewed(uuid[]) from public, anon;
grant execute on function public.get_my_daily_feed() to authenticated;
grant execute on function public.mark_my_feed_posts_viewed(uuid[]) to authenticated;

insert into public.subjects (slug, name, description)
values ('mindfulness', 'Mindfulness', 'Attention, presence, reflection, and everyday awareness.')
on conflict (slug) do update
set name = excluded.name, description = excluded.description, is_active = true;
