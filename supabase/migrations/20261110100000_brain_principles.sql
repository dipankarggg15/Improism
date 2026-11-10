-- Improism Brain: private, admin-managed philosophy library.

create table public.brain_principles (
  id uuid primary key default gen_random_uuid(),
  principle_number integer not null unique check (principle_number between 1 and 9999),
  title text not null check (char_length(title) between 3 and 200),
  content text not null check (char_length(content) between 1 and 100000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brain_principles_set_updated_at
before update on public.brain_principles
for each row execute function public.set_updated_at();

alter table public.brain_principles enable row level security;

revoke all on table public.brain_principles from anon, authenticated;
grant select, insert, update, delete on table public.brain_principles to authenticated;

create policy "brain_principles_admin_select"
on public.brain_principles for select to authenticated
using ((select public.is_admin()));

create policy "brain_principles_admin_insert"
on public.brain_principles for insert to authenticated
with check ((select public.is_admin()));

create policy "brain_principles_admin_update"
on public.brain_principles for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "brain_principles_admin_delete"
on public.brain_principles for delete to authenticated
using ((select public.is_admin()));
