-- Improism backend foundation: profiles, subjects, content, and saved posts.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 300),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_subjects (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 600),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_have_a_date check (status <> 'published' or published_at is not null)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  body text not null check (char_length(body) > 0),
  reading_minutes smallint not null default 1 check (reading_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index user_subjects_subject_id_idx on public.user_subjects(subject_id);
create index posts_subject_status_published_idx on public.posts(subject_id, status, published_at desc);
create index posts_created_by_idx on public.posts(created_by);
create index saved_posts_post_id_idx on public.saved_posts(post_id);
create index saved_posts_user_created_idx on public.saved_posts(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger subjects_set_updated_at before update on public.subjects
for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Improism member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change profile roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role before update on public.profiles
for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.user_subjects enable row level security;
alter table public.posts enable row level security;
alter table public.articles enable row level security;
alter table public.saved_posts enable row level security;

revoke all on table public.profiles, public.subjects, public.user_subjects, public.posts, public.articles, public.saved_posts from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.subjects to authenticated;
grant select, insert, delete on table public.user_subjects to authenticated;
grant select on table public.posts, public.articles to authenticated;
grant select, insert, delete on table public.saved_posts to authenticated;

-- Admin policies below require matching table grants in addition to RLS.
grant insert, update, delete on table public.subjects, public.posts, public.articles to authenticated;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check ((select auth.uid()) = id or (select public.is_admin()));

create policy "subjects_read_active_or_admin"
on public.subjects for select to authenticated
using (is_active or (select public.is_admin()));

create policy "subjects_admin_insert"
on public.subjects for insert to authenticated
with check ((select public.is_admin()));
create policy "subjects_admin_update"
on public.subjects for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "subjects_admin_delete"
on public.subjects for delete to authenticated
using ((select public.is_admin()));

create policy "user_subjects_select_own"
on public.user_subjects for select to authenticated
using ((select auth.uid()) = user_id);
create policy "user_subjects_insert_own"
on public.user_subjects for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "user_subjects_delete_own"
on public.user_subjects for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "posts_read_published_or_admin"
on public.posts for select to authenticated
using (status = 'published' or (select public.is_admin()));
create policy "posts_admin_insert"
on public.posts for insert to authenticated
with check ((select public.is_admin()));
create policy "posts_admin_update"
on public.posts for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "posts_admin_delete"
on public.posts for delete to authenticated
using ((select public.is_admin()));

create policy "articles_read_for_published_posts_or_admin"
on public.articles for select to authenticated
using (
  (select public.is_admin()) or exists (
    select 1 from public.posts
    where posts.id = articles.post_id and posts.status = 'published'
  )
);
create policy "articles_admin_insert"
on public.articles for insert to authenticated
with check ((select public.is_admin()));
create policy "articles_admin_update"
on public.articles for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "articles_admin_delete"
on public.articles for delete to authenticated
using ((select public.is_admin()));

create policy "saved_posts_select_own"
on public.saved_posts for select to authenticated
using ((select auth.uid()) = user_id);
create policy "saved_posts_insert_own"
on public.saved_posts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "saved_posts_delete_own"
on public.saved_posts for delete to authenticated
using ((select auth.uid()) = user_id);

insert into public.subjects (slug, name, description)
values
  ('personal-growth', 'Personal Growth', 'Habits, identity, confidence, and self-awareness.'),
  ('philosophy', 'Philosophy', 'Questions and ideas for living with intention.'),
  ('business', 'Business', 'Better systems, judgment, leadership, and work.'),
  ('health', 'Health', 'Sustainable thinking about mind and body.'),
  ('relationships', 'Relationships', 'Connection, communication, and belonging.'),
  ('creativity', 'Creativity', 'Original thinking and making meaningful things.'),
  ('science', 'Science', 'Useful discoveries about people and the world.'),
  ('money', 'Money', 'Clearer decisions about earning, saving, and enough.')
on conflict (slug) do update
set name = excluded.name, description = excluded.description, is_active = true;
