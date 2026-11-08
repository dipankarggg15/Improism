"use client";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Edit3,
  MessageCircleMore,
  MoreHorizontal,
  Plus,
  Route,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useJourneys } from "@/components/journeys/journeys-provider";
import type { Journey, JourneyActivity } from "@/lib/journey-data";

type DetailTab = "plan" | "progress" | "review";

const tabs: Array<{ id: DetailTab; label: string; icon: typeof Route }> = [
  { id: "plan", label: "My Plan", icon: Route },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "review", label: "AI Review", icon: Sparkles },
];

function ActivityEditor({
  journeyId,
  activity,
  onDone,
}: {
  journeyId: string;
  activity: JourneyActivity;
  onDone: () => void;
}) {
  const { updateActivity } = useJourneys();
  const [title, setTitle] = useState(activity.title);
  const [frequency, setFrequency] = useState(activity.frequency);

  function save() {
    if (!title.trim()) return;
    updateActivity(journeyId, activity.id, {
      title: title.trim(),
      frequency: frequency.trim() || "Flexible",
    });
    onDone();
  }

  return (
    <div className="grid gap-2 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_170px_auto] sm:items-center">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
        aria-label="Activity title"
      />
      <input
        value={frequency}
        onChange={(event) => setFrequency(event.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
        aria-label="Activity frequency"
      />
      <button
        type="button"
        onClick={save}
        className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white"
      >
        <Save className="size-3.5" aria-hidden="true" />
        Save
      </button>
    </div>
  );
}

function EditJourneyForm({
  journey,
  onClose,
}: {
  journey: Journey;
  onClose: () => void;
}) {
  const { updateJourney } = useJourneys();
  const [title, setTitle] = useState(journey.title);
  const [description, setDescription] = useState(journey.description);
  const [goal, setGoal] = useState(journey.goal);
  const [deadline, setDeadline] = useState(journey.deadline ?? "");
  const [current, setCurrent] = useState(String(journey.target?.current ?? ""));
  const [total, setTotal] = useState(String(journey.target?.total ?? ""));
  const [unit, setUnit] = useState(journey.target?.unit ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !goal.trim()) return;
    updateJourney(journey.id, {
      title: title.trim(),
      description: description.trim(),
      goal: goal.trim(),
      deadline: deadline || undefined,
      target: journey.target
        ? {
            current: Math.max(0, Number(current) || 0),
            total: Math.max(1, Number(total) || 1),
            unit: unit.trim() || "units",
          }
        : undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:p-5">
      <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal leading-6 text-black outline-none focus:border-black"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
        Intention
        <input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      {journey.target && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
            Current
            <input
              type="number"
              min="0"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
            Target
            <input
              type="number"
              min="1"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
            Unit
            <input
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
        </div>
      )}
      <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 sm:max-w-xs">
        Optional deadline
        <input
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}

function PlanTab({ journey }: { journey: Journey }) {
  const { addActivity, removeActivity, toggleActivity } = useJourneys();
  const [editingJourney, setEditingJourney] = useState(false);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [addingActivity, setAddingActivity] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState("Daily");

  function addNewActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    addActivity(journey.id, {
      title: newTitle.trim(),
      frequency: newFrequency.trim() || "Flexible",
    });
    setNewTitle("");
    setNewFrequency("Daily");
    setAddingActivity(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
      <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Journey intention
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{journey.goal}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">{journey.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingJourney((current) => !current)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold hover:border-black"
          >
            <Edit3 className="size-3.5" aria-hidden="true" />
            Edit
          </button>
        </div>

        {editingJourney && (
          <EditJourneyForm journey={journey} onClose={() => setEditingJourney(false)} />
        )}

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-3 py-1.5">
            {journey.kind === "measurable" ? "Measurable goal" : "Ongoing practice"}
          </span>
          {journey.deadline && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Target date {journey.deadline}
            </span>
          )}
        </div>
      </section>

      <section className="rounded-[1.4rem] bg-black p-5 text-white sm:p-6">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-white/45">
          A gentle reminder
        </p>
        <p className="mt-4 text-xl font-semibold leading-7 tracking-[-0.03em]">
          The plan should support your life, not become another thing to perform.
        </p>
        <p className="mt-4 text-xs leading-5 text-white/50">Adjust it whenever reality teaches you something new.</p>
      </section>

      <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Planned activities</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Small actions that make the journey easier to live.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddingActivity(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-black px-3.5 py-2 text-xs font-semibold text-white"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add activity
          </button>
        </div>

        {addingActivity && (
          <form onSubmit={addNewActivity} className="mt-5 grid gap-2 rounded-2xl bg-zinc-50 p-3 sm:grid-cols-[1fr_180px_auto]">
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="New activity"
              autoFocus
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            />
            <input
              value={newFrequency}
              onChange={(event) => setNewFrequency(event.target.value)}
              placeholder="Frequency"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            />
            <div className="flex gap-1">
              <button type="submit" className="rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white">
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingActivity(false)}
                className="grid size-10 place-items-center rounded-xl text-zinc-400 hover:bg-white hover:text-black"
                aria-label="Cancel adding activity"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 divide-y divide-zinc-100">
          {journey.activities.map((activity) =>
            editingActivity === activity.id ? (
              <div key={activity.id} className="py-3">
                <ActivityEditor
                  journeyId={journey.id}
                  activity={activity}
                  onDone={() => setEditingActivity(null)}
                />
              </div>
            ) : (
              <div key={activity.id} className="flex items-center gap-3 py-4">
                <button
                  type="button"
                  onClick={() => toggleActivity(journey.id, activity.id)}
                  className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${
                    activity.completedToday
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 text-transparent hover:border-black"
                  }`}
                  aria-label={
                    activity.completedToday
                      ? `Mark ${activity.title} incomplete`
                      : `Complete ${activity.title}`
                  }
                >
                  <Check className="size-3.5" aria-hidden="true" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${activity.completedToday ? "text-zinc-400 line-through" : ""}`}>
                    {activity.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{activity.frequency}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingActivity(activity.id)}
                  className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-black"
                  aria-label={`Edit ${activity.title}`}
                >
                  <Edit3 className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeActivity(journey.id, activity.id)}
                  className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-black"
                  aria-label={`Remove ${activity.title}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function ProgressTab({ journey }: { journey: Journey }) {
  const { addReflection } = useJourneys();
  const [reflection, setReflection] = useState("");
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const completions = dayLabels.map((_, dayIndex) =>
    journey.activities.reduce(
      (total, activity) => total + (activity.history[dayIndex] ? 1 : 0),
      0,
    ),
  );
  const maxCompletions = Math.max(1, journey.activities.length);
  const weeklyTotal = completions.reduce((total, value) => total + value, 0);
  const targetPercent = journey.target
    ? Math.min(100, (journey.target.current / journey.target.total) * 100)
    : null;

  function saveReflection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reflection.trim()) return;
    addReflection(journey.id, reflection.trim());
    setReflection("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Last seven days
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">A steady, flexible rhythm</h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold">
            {weeklyTotal} check-ins
          </span>
        </div>

        <div className="mt-8 flex h-44 items-end justify-between gap-2 border-b border-zinc-200 px-1">
          {completions.map((count, index) => (
            <div key={`${dayLabels[index]}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[0.65rem] font-medium text-zinc-400">{count || "·"}</span>
              <div
                className={`w-full max-w-10 rounded-t-lg ${count ? "bg-black" : "bg-zinc-100"}`}
                style={{ height: `${Math.max(8, (count / maxCompletions) * 110)}px` }}
              />
              <span className="pb-2 text-[0.65rem] text-zinc-400">{dayLabels[index]}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          This view notices participation without turning quieter days into failure.
        </p>
      </section>

      <section className="rounded-[1.4rem] bg-black p-5 text-white sm:p-6">
        {journey.target && targetPercent !== null ? (
          <>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-white/45">
              Goal progress
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              {journey.target.current}
              <span className="text-xl text-white/40"> / {journey.target.total}</span>
            </p>
            <p className="mt-1 text-sm text-white/55">{journey.target.unit} completed</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${targetPercent}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">
              {Math.round(targetPercent)}% of the current target, with room to adjust the plan.
            </p>
          </>
        ) : (
          <>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-white/45">
              What is changing
            </p>
            <p className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.04em]">
              This journey is measured in awareness, not a finish line.
            </p>
            <p className="mt-4 text-sm leading-6 text-white/55">
              Look for easier beginnings, more intentional choices, and moments when the new response feels natural.
            </p>
          </>
        )}
      </section>

      <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-2">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div>
            <h2 className="font-semibold">Reflections and notes</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Capture what you are learning, not only what you completed.
            </p>
            <form onSubmit={saveReflection} className="mt-4">
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                rows={4}
                placeholder="What felt different? What helped? What would you like to try next?"
                className="w-full resize-none rounded-2xl border border-zinc-300 px-4 py-3 text-sm leading-6 outline-none placeholder:text-zinc-400 focus:border-black"
              />
              <button
                type="submit"
                disabled={!reflection.trim()}
                className="mt-3 rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                Save reflection
              </button>
            </form>
          </div>
          <div className="space-y-3">
            {journey.reflections.length ? (
              journey.reflections.map((item) => (
                <article key={item.id} className="rounded-2xl bg-zinc-50 p-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    {item.date}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.content}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center">
                <p className="text-sm font-medium">No reflections yet</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">Your first note can be short and unfinished.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewTab({ journey }: { journey: Journey }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-black text-white">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Improism AI review</p>
              <p className="text-xs text-zinc-400">
                Sample guidance for {journey.title} · based on mock activity
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            What seems to be working
          </p>
          <p className="mt-3 text-lg leading-8 tracking-[-0.02em] text-zinc-800">
            You are most consistent when the activity has a clear beginning and can fit into an ordinary day. The smaller actions appear to be creating the stability that the larger intention needs.
          </p>

          <div className="my-7 border-t border-zinc-200" />

          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            A pattern worth noticing
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Your reflections focus more on how the practice changes the quality of your day than on completing every activity. That is useful evidence: this journey may benefit from protecting one anchor activity and treating the others as flexible support.
          </p>

          <div className="mt-7 rounded-2xl bg-zinc-100 p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Gentle experiment for next week
            </p>
            <p className="mt-2 text-sm font-medium leading-6">
              Choose the activity that most changes the tone of your day. Make it the only “essential” one for seven days, and notice whether the others happen more naturally.
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-[1.4rem] bg-black p-5 text-white sm:p-6">
          <MessageCircleMore className="size-5" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">Discuss this journey</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Ask questions, challenge the review, or think through what to change next.
          </p>
          <Link
            href={`/ai?journey=${journey.id}`}
            className="mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Discuss with AI
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
        <section className="rounded-[1.4rem] border border-zinc-200 p-5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">Future review inputs</p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-600">
            {["Activity history", "Your reflections", "Changes to the plan", "Conversation context"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Circle className="size-2" fill="currentColor" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </aside>

    </div>
  );
}

export function JourneyDetail({ journeyId }: { journeyId: string }) {
  const { journeys } = useJourneys();
  const [activeTab, setActiveTab] = useState<DetailTab>("plan");
  const journey = journeys.find((item) => item.id === journeyId);

  if (!journey) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div>
          <Route className="mx-auto size-8 text-zinc-300" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">Journey not found</h1>
          <p className="mt-2 text-sm text-zinc-500">This prototype journey may have reset after a refresh.</p>
          <Link href="/journeys" className="mt-5 inline-flex rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white">
            Return to journeys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/journeys" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All journeys
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            <Route className="size-3.5" aria-hidden="true" />
            {journey.kind === "measurable" ? "Measurable journey" : "Ongoing journey"}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{journey.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Updated today
          <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-zinc-100" aria-label="More journey options">
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto border-b border-zinc-200" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "plan" && <PlanTab journey={journey} />}
        {activeTab === "progress" && <ProgressTab journey={journey} />}
        {activeTab === "review" && <ReviewTab journey={journey} />}
      </div>
    </div>
  );
}
