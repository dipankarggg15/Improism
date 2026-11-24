import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const [profile, subjects, savedPosts, feedStates, journeys] = await Promise.all([
    supabase.from("profiles").select("display_name, bio, timezone, theme, notification_daily, notification_journeys, notification_reflections, personalization_enabled, created_at, updated_at").single(),
    supabase.from("user_subjects").select("created_at, subjects(name, description)"),
    supabase.from("saved_posts").select("created_at, posts(title, excerpt, subjects(name))"),
    supabase.from("feed_states").select("subject_id, cycle, allocation_date, allocated_post_ids, viewed_allocated_post_ids, daily_issued_count, updated_at"),
    supabase.from("journeys").select("id, title, description, goal, kind, target_current, target_total, target_unit, deadline, status, created_at, updated_at, journey_activities(id, title, frequency, position, journey_completions(completion_date)), journey_reflections(id, content, reflected_on, created_at)"),
  ]);

  const failed = [profile, subjects, savedPosts, feedStates, journeys].find((result) => result.error);
  if (failed?.error) {
    return Response.json({ error: failed.error.message }, { status: 500 });
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    exported_at: exportedAt,
    account: { email: userData.user.email, id: userData.user.id },
    profile: profile.data,
    selected_subjects: subjects.data,
    saved_posts: savedPosts.data,
    feed_state: feedStates.data,
    journeys: journeys.data,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="improism-data-${exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
