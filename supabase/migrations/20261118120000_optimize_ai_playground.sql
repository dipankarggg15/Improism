-- Streaming performance telemetry and a single ordered query for governing documents.

alter table public.ai_test_messages
  add column cached_input_tokens integer check (cached_input_tokens is null or cached_input_tokens >= 0),
  add column cache_write_tokens integer check (cache_write_tokens is null or cache_write_tokens >= 0),
  add column reasoning_tokens integer check (reasoning_tokens is null or reasoning_tokens >= 0),
  add column reasoning_effort text check (reasoning_effort is null or reasoning_effort in ('none', 'low', 'medium', 'high')),
  add column total_duration_ms integer check (total_duration_ms is null or total_duration_ms >= 0),
  add column brain_load_ms integer check (brain_load_ms is null or brain_load_ms >= 0),
  add column first_token_ms integer check (first_token_ms is null or first_token_ms >= 0),
  add column completion_ms integer check (completion_ms is null or completion_ms >= 0);

create or replace function public.get_ai_governing_documents()
returns table (
  kind text,
  id uuid,
  document_number integer,
  title text,
  content text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select ordered.kind, ordered.id, ordered.document_number, ordered.title, ordered.content, ordered.updated_at
  from (
    select 1 as kind_order, 'ai_rule'::text as kind, r.id, r.rule_number as document_number,
      r.title, r.content, r.updated_at
    from public.ai_rules r
    union all
    select 2 as kind_order, 'brain_principle'::text as kind, p.id,
      p.principle_number as document_number, p.title, p.content, p.updated_at
    from public.brain_principles p
  ) ordered
  order by ordered.kind_order, ordered.document_number;
$$;

revoke all on function public.get_ai_governing_documents() from public, anon;
grant execute on function public.get_ai_governing_documents() to authenticated;
