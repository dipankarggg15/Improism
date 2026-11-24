"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Journey, JourneyActivity, NewJourneyInput } from "@/lib/journey-data";

type JourneyUpdates = Pick<Journey, "title" | "description" | "goal"> & Partial<Pick<Journey, "deadline" | "target">>;
type JourneysContextValue = {
  journeys: Journey[];
  loading: boolean;
  error: string;
  createJourney: (input: NewJourneyInput) => string;
  updateJourney: (journeyId: string, updates: JourneyUpdates) => void;
  addActivity: (journeyId: string, activity: Pick<JourneyActivity, "title" | "frequency">) => void;
  updateActivity: (journeyId: string, activityId: string, updates: Pick<JourneyActivity, "title" | "frequency">) => void;
  removeActivity: (journeyId: string, activityId: string) => void;
  toggleActivity: (journeyId: string, activityId: string) => void;
  addReflection: (journeyId: string, content: string) => void;
  setJourneyStatus: (journeyId: string, status: Journey["status"]) => void;
  deleteJourney: (journeyId: string) => void;
};

type JourneyRow = {
  id: string;
  title: string;
  description: string;
  goal: string;
  kind: "measurable" | "ongoing";
  target_current: number | null;
  target_total: number | null;
  target_unit: string | null;
  deadline: string | null;
  status: "active" | "paused";
  journey_activities: Array<{
    id: string;
    title: string;
    frequency: string;
    position: number;
    journey_completions: Array<{ completion_date: string }>;
  }>;
  journey_reflections: Array<{ id: string; content: string; reflected_on: string; created_at: string }>;
};

const JourneysContext = createContext<JourneysContextValue | null>(null);

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function recentDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return localDate(date);
  });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "journey";
}

function mapJourney(row: JourneyRow): Journey {
  const dates = recentDates();
  const today = dates[dates.length - 1];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    goal: row.goal,
    kind: row.kind,
    target: row.kind === "measurable" && row.target_total && row.target_unit
      ? { current: row.target_current ?? 0, total: row.target_total, unit: row.target_unit }
      : undefined,
    deadline: row.deadline ?? undefined,
    activities: [...row.journey_activities].sort((a, b) => a.position - b.position).map((activity) => {
      const completed = new Set(activity.journey_completions.map((item) => item.completion_date));
      return {
        id: activity.id,
        title: activity.title,
        frequency: activity.frequency,
        completedToday: completed.has(today),
        history: dates.map((date) => completed.has(date)),
      };
    }),
    reflections: [...row.journey_reflections].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((reflection) => ({
      id: reflection.id,
      date: new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${reflection.reflected_on}T12:00:00`)),
      content: reflection.content,
    })),
    status: row.status,
  };
}

export function JourneysProvider({ children }: { children: ReactNode }) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJourneys = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    const { data, error: queryError } = await createClient()
      .from("journeys")
      .select("id, title, description, goal, kind, target_current, target_total, target_unit, deadline, status, journey_activities(id, title, frequency, position, journey_completions(completion_date)), journey_reflections(id, content, reflected_on, created_at)")
      .order("updated_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else {
      setJourneys(((data ?? []) as unknown as JourneyRow[]).map(mapJourney));
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadJourneys(), 0);
    return () => window.clearTimeout(timer);
  }, [loadJourneys]);

  async function currentUserId() {
    const { data, error: authError } = await createClient().auth.getUser();
    if (authError || !data.user) throw new Error("Your session has expired.");
    return data.user.id;
  }

  function reportMutationError(reason: unknown) {
    setError(reason instanceof Error ? reason.message : "Journey changes could not be saved.");
    void loadJourneys();
  }

  function createJourney(input: NewJourneyInput) {
    const id = crypto.randomUUID();
    const slug = `${slugify(input.title)}-${id.slice(0, 8)}`;
    const journey: Journey = {
      id,
      ...input,
      activities: input.activities.map((activity) => ({
        id: crypto.randomUUID(), ...activity, completedToday: false,
        history: [false, false, false, false, false, false, false],
      })),
      reflections: [],
      status: "active",
    };
    setJourneys((current) => [journey, ...current]);
    void (async () => {
      try {
        const userId = await currentUserId();
        const supabase = createClient();
        const { error: journeyError } = await supabase.from("journeys").insert({
          id, user_id: userId, slug, title: input.title, description: input.description,
          goal: input.goal, kind: input.kind, target_current: input.target?.current ?? null,
          target_total: input.target?.total ?? null, target_unit: input.target?.unit ?? null,
          deadline: input.deadline ?? null,
        });
        if (journeyError) throw journeyError;
        if (journey.activities.length) {
          const { error: activitiesError } = await supabase.from("journey_activities").insert(
            journey.activities.map((activity, position) => ({
              id: activity.id, journey_id: id, title: activity.title, frequency: activity.frequency, position,
            })),
          );
          if (activitiesError) throw activitiesError;
        }
        setError("");
      } catch (reason) { reportMutationError(reason); }
    })();
    return id;
  }

  function updateJourney(journeyId: string, updates: JourneyUpdates) {
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? { ...journey, ...updates } : journey));
    void createClient().from("journeys").update({
      title: updates.title, description: updates.description, goal: updates.goal,
      deadline: updates.deadline ?? null, target_current: updates.target?.current ?? null,
      target_total: updates.target?.total ?? null, target_unit: updates.target?.unit ?? null,
    }).eq("id", journeyId).then(({ error: updateError }) => updateError ? reportMutationError(updateError) : setError(""));
  }

  function addActivity(journeyId: string, activity: Pick<JourneyActivity, "title" | "frequency">) {
    const id = crypto.randomUUID();
    const position = journeys.find((journey) => journey.id === journeyId)?.activities.length ?? 0;
    const next = { id, ...activity, completedToday: false, history: [false, false, false, false, false, false, false] };
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? { ...journey, activities: [...journey.activities, next] } : journey));
    void createClient().from("journey_activities").insert({ id, journey_id: journeyId, ...activity, position })
      .then(({ error: insertError }) => insertError ? reportMutationError(insertError) : setError(""));
  }

  function updateActivity(journeyId: string, activityId: string, updates: Pick<JourneyActivity, "title" | "frequency">) {
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? {
      ...journey, activities: journey.activities.map((activity) => activity.id === activityId ? { ...activity, ...updates } : activity),
    } : journey));
    void createClient().from("journey_activities").update(updates).eq("id", activityId)
      .then(({ error: updateError }) => updateError ? reportMutationError(updateError) : setError(""));
  }

  function removeActivity(journeyId: string, activityId: string) {
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? {
      ...journey, activities: journey.activities.filter((activity) => activity.id !== activityId),
    } : journey));
    void createClient().from("journey_activities").delete().eq("id", activityId)
      .then(({ error: deleteError }) => deleteError ? reportMutationError(deleteError) : setError(""));
  }

  function toggleActivity(journeyId: string, activityId: string) {
    const activity = journeys.find((journey) => journey.id === journeyId)?.activities.find((item) => item.id === activityId);
    if (!activity) return;
    const completedToday = !activity.completedToday;
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? {
      ...journey,
      activities: journey.activities.map((item) => item.id === activityId ? {
        ...item, completedToday,
        history: item.history.map((value, index) => index === item.history.length - 1 ? completedToday : value),
      } : item),
    } : journey));
    void (async () => {
      try {
        const userId = await currentUserId();
        const supabase = createClient();
        const query = completedToday
          ? supabase.from("journey_completions").upsert({ activity_id: activityId, user_id: userId, completion_date: localDate() })
          : supabase.from("journey_completions").delete().eq("activity_id", activityId).eq("completion_date", localDate());
        const { error: completionError } = await query;
        if (completionError) throw completionError;
        setError("");
      } catch (reason) { reportMutationError(reason); }
    })();
  }

  function addReflection(journeyId: string, content: string) {
    const id = crypto.randomUUID();
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? {
      ...journey, reflections: [{ id, date: "Today", content }, ...journey.reflections],
    } : journey));
    void (async () => {
      try {
        const userId = await currentUserId();
        const { error: insertError } = await createClient().from("journey_reflections").insert({
          id, journey_id: journeyId, user_id: userId, content, reflected_on: localDate(),
        });
        if (insertError) throw insertError;
        setError("");
      } catch (reason) { reportMutationError(reason); }
    })();
  }

  function setJourneyStatus(journeyId: string, status: Journey["status"]) {
    setJourneys((current) => current.map((journey) => journey.id === journeyId ? { ...journey, status } : journey));
    void createClient().from("journeys").update({ status }).eq("id", journeyId)
      .then(({ error: updateError }) => updateError ? reportMutationError(updateError) : setError(""));
  }

  function deleteJourney(journeyId: string) {
    setJourneys((current) => current.filter((journey) => journey.id !== journeyId));
    void createClient().from("journeys").delete().eq("id", journeyId)
      .then(({ error: deleteError }) => deleteError ? reportMutationError(deleteError) : setError(""));
  }

  return <JourneysContext.Provider value={{
    journeys, loading, error, createJourney, updateJourney, addActivity,
    updateActivity, removeActivity, toggleActivity, addReflection, setJourneyStatus, deleteJourney,
  }}>{children}</JourneysContext.Provider>;
}

export function useJourneys() {
  const context = useContext(JourneysContext);
  if (!context) throw new Error("useJourneys must be used within JourneysProvider");
  return context;
}
