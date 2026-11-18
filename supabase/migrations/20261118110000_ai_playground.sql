-- Private admin AI testing playground.

create table public.ai_test_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New conversation' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_test_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_test_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  model text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  total_tokens integer check (total_tokens is null or total_tokens >= 0),
  openai_response_id text,
  governing_documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_test_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.ai_test_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  verdict text not null check (verdict in ('correct', 'incorrect')),
  correction text not null default '' check (char_length(correction) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_test_conversations_user_updated_idx
on public.ai_test_conversations(user_id, updated_at desc);
create index ai_test_messages_conversation_created_idx
on public.ai_test_messages(conversation_id, created_at);
create index ai_test_messages_created_idx
on public.ai_test_messages(created_at desc);
create index ai_test_feedback_user_created_idx
on public.ai_test_feedback(user_id, created_at desc);

create trigger ai_test_conversations_set_updated_at
before update on public.ai_test_conversations
for each row execute function public.set_updated_at();
create trigger ai_test_feedback_set_updated_at
before update on public.ai_test_feedback
for each row execute function public.set_updated_at();

alter table public.ai_test_conversations enable row level security;
alter table public.ai_test_messages enable row level security;
alter table public.ai_test_feedback enable row level security;

revoke all on table public.ai_test_conversations, public.ai_test_messages, public.ai_test_feedback from anon, authenticated;
grant select, insert, update, delete on table public.ai_test_conversations to authenticated;
grant select, insert, delete on table public.ai_test_messages to authenticated;
grant select, insert, update, delete on table public.ai_test_feedback to authenticated;

create policy "ai_test_conversations_admin_select"
on public.ai_test_conversations for select to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()));
create policy "ai_test_conversations_admin_insert"
on public.ai_test_conversations for insert to authenticated
with check ((select public.is_admin()) and user_id = (select auth.uid()));
create policy "ai_test_conversations_admin_update"
on public.ai_test_conversations for update to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()))
with check ((select public.is_admin()) and user_id = (select auth.uid()));
create policy "ai_test_conversations_admin_delete"
on public.ai_test_conversations for delete to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()));

create policy "ai_test_messages_admin_select"
on public.ai_test_messages for select to authenticated
using (
  (select public.is_admin()) and exists (
    select 1 from public.ai_test_conversations c
    where c.id = conversation_id and c.user_id = (select auth.uid())
  )
);
create policy "ai_test_messages_admin_insert"
on public.ai_test_messages for insert to authenticated
with check (
  (select public.is_admin()) and exists (
    select 1 from public.ai_test_conversations c
    where c.id = conversation_id and c.user_id = (select auth.uid())
  )
);
create policy "ai_test_messages_admin_delete"
on public.ai_test_messages for delete to authenticated
using (
  (select public.is_admin()) and exists (
    select 1 from public.ai_test_conversations c
    where c.id = conversation_id and c.user_id = (select auth.uid())
  )
);

create policy "ai_test_feedback_admin_select"
on public.ai_test_feedback for select to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()));
create policy "ai_test_feedback_admin_insert"
on public.ai_test_feedback for insert to authenticated
with check (
  (select public.is_admin())
  and user_id = (select auth.uid())
  and exists (
    select 1
    from public.ai_test_messages m
    join public.ai_test_conversations c on c.id = m.conversation_id
    where m.id = message_id
      and m.role = 'assistant'
      and c.user_id = (select auth.uid())
  )
);
create policy "ai_test_feedback_admin_update"
on public.ai_test_feedback for update to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()))
with check (
  (select public.is_admin())
  and user_id = (select auth.uid())
  and exists (
    select 1
    from public.ai_test_messages m
    join public.ai_test_conversations c on c.id = m.conversation_id
    where m.id = message_id
      and m.role = 'assistant'
      and c.user_id = (select auth.uid())
  )
);
create policy "ai_test_feedback_admin_delete"
on public.ai_test_feedback for delete to authenticated
using ((select public.is_admin()) and user_id = (select auth.uid()));
