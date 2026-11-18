-- Improism AI Rules: private, admin-managed AI instruction library.

create table public.ai_rules (
  id uuid primary key default gen_random_uuid(),
  rule_number integer not null unique check (rule_number between 1 and 9999),
  title text not null check (char_length(title) between 3 and 200),
  content text not null check (char_length(content) between 1 and 100000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_rules_set_updated_at
before update on public.ai_rules
for each row execute function public.set_updated_at();

alter table public.ai_rules enable row level security;

revoke all on table public.ai_rules from anon, authenticated;
grant select, insert, update, delete on table public.ai_rules to authenticated;

create policy "ai_rules_admin_select"
on public.ai_rules for select to authenticated
using ((select public.is_admin()));

create policy "ai_rules_admin_insert"
on public.ai_rules for insert to authenticated
with check ((select public.is_admin()));

create policy "ai_rules_admin_update"
on public.ai_rules for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "ai_rules_admin_delete"
on public.ai_rules for delete to authenticated
using ((select public.is_admin()));
