-- Let administrators review and moderate member feedback while members remain
-- limited to submitting their own feedback.

grant select, delete on table public.feedback to authenticated;

drop policy if exists "feedback_admin_select" on public.feedback;
create policy "feedback_admin_select" on public.feedback
for select to authenticated
using ((select public.is_admin()));

drop policy if exists "feedback_admin_delete" on public.feedback;
create policy "feedback_admin_delete" on public.feedback
for delete to authenticated
using ((select public.is_admin()));
