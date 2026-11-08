"use client";

import {
  ArrowLeft,
  CalendarDays,
  CircleDot,
  Infinity as InfinityIcon,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useJourneys } from "@/components/journeys/journeys-provider";
import type { JourneyKind } from "@/lib/journey-data";

type DraftActivity = {
  id: number;
  title: string;
  frequency: string;
};

export function CreateJourney() {
  const router = useRouter();
  const { createJourney } = useJourneys();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [kind, setKind] = useState<JourneyKind>("ongoing");
  const [targetTotal, setTargetTotal] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [activities, setActivities] = useState<DraftActivity[]>([
    { id: 1, title: "", frequency: "Daily" },
  ]);

  function updateActivity(id: number, updates: Partial<DraftActivity>) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, ...updates } : activity,
      ),
    );
  }

  function removeActivity(id: number) {
    setActivities((current) => current.filter((activity) => activity.id !== id));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !goal.trim()) return;

    const validActivities = activities
      .filter((activity) => activity.title.trim())
      .map((activity) => ({
        title: activity.title.trim(),
        frequency: activity.frequency.trim() || "Flexible",
      }));

    const total = Number(targetTotal);
    const journeyId = createJourney({
      title: title.trim(),
      description: description.trim(),
      goal: goal.trim(),
      kind,
      target:
        kind === "measurable" && total > 0
          ? {
              current: 0,
              total,
              unit: targetUnit.trim() || "units",
            }
          : undefined,
      deadline: deadline || undefined,
      activities: validActivities,
    });

    router.push(`/journeys/${journeyId}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-9">
      <Link
        href="/journeys"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to journeys
      </Link>

      <header className="mt-7">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Start something meaningful
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          Create a new journey
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
          Give the direction a name, choose a few supportive actions, and adjust it as you learn.
        </p>
      </header>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">
              Journey title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="e.g. Build a stronger reading habit"
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-normal outline-none placeholder:text-zinc-400 focus:border-black"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={3}
                placeholder="What would you like this journey to change or make possible?"
                className="resize-none rounded-xl border border-zinc-300 px-4 py-3 text-sm font-normal leading-6 outline-none placeholder:text-zinc-400 focus:border-black"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Your intention
              <input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                required
                placeholder="What does meaningful progress look or feel like?"
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-normal outline-none placeholder:text-zinc-400 focus:border-black"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-7">
          <p className="text-sm font-semibold">What kind of journey is this?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setKind("ongoing")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                kind === "ongoing"
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <InfinityIcon className="size-5" aria-hidden="true" />
              <span className="mt-4 block text-sm font-semibold">Ongoing improvement</span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  kind === "ongoing" ? "text-white/60" : "text-zinc-500"
                }`}
              >
                For qualities and practices that keep evolving without a finish line.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setKind("measurable")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                kind === "measurable"
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <CircleDot className="size-5" aria-hidden="true" />
              <span className="mt-4 block text-sm font-semibold">Measurable goal</span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  kind === "measurable" ? "text-white/60" : "text-zinc-500"
                }`}
              >
                For a clear target such as modules, kilometres, sessions, or kilograms.
              </span>
            </button>
          </div>

          {kind === "measurable" && (
            <div className="mt-5 grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-3">
              <label className="grid gap-2 text-xs font-semibold text-zinc-600">
                Target
                <input
                  type="number"
                  min="1"
                  value={targetTotal}
                  onChange={(event) => setTargetTotal(event.target.value)}
                  placeholder="12"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
                />
              </label>
              <label className="grid gap-2 text-xs font-semibold text-zinc-600">
                Unit
                <input
                  value={targetUnit}
                  onChange={(event) => setTargetUnit(event.target.value)}
                  placeholder="modules"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
                />
              </label>
              <label className="grid gap-2 text-xs font-semibold text-zinc-600">
                Optional deadline
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm font-normal text-black outline-none focus:border-black"
                  />
                </div>
              </label>
            </div>
          )}
        </section>

        <section className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Planned activities</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Start with a small set. You can add or change activities later.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setActivities((current) => [
                  ...current,
                  { id: Date.now(), title: "", frequency: "Daily" },
                ])
              }
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold hover:border-black"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="grid gap-2 rounded-2xl bg-zinc-50 p-3 sm:grid-cols-[1fr_170px_auto] sm:items-center">
                <input
                  value={activity.title}
                  onChange={(event) =>
                    updateActivity(activity.id, { title: event.target.value })
                  }
                  placeholder={`Activity ${index + 1}`}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400 focus:border-black"
                />
                <select
                  value={activity.frequency}
                  onChange={(event) =>
                    updateActivity(activity.id, { frequency: event.target.value })
                  }
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                  aria-label={`Frequency for activity ${index + 1}`}
                >
                  <option>Daily</option>
                  <option>Weekdays</option>
                  <option>3 times a week</option>
                  <option>Twice a week</option>
                  <option>Weekly</option>
                  <option>Flexible</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeActivity(activity.id)}
                  className="grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white hover:text-black disabled:opacity-30"
                  disabled={activities.length === 1}
                  aria-label="Remove activity"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/journeys"
            className="rounded-full border border-zinc-300 px-5 py-3 text-center text-sm font-semibold hover:border-black"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Create journey
          </button>
        </div>
      </form>
    </div>
  );
}
