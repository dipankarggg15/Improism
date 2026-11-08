"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  MessageCircleMore,
  Plus,
  Route,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useJourneys } from "@/components/journeys/journeys-provider";

export function JourneysOverview() {
  const { journeys, toggleActivity } = useJourneys();
  const activeJourneys = journeys.filter((journey) => journey.status === "active");
  const todayActivities = activeJourneys.flatMap((journey) =>
    journey.activities.map((activity) => ({
      ...activity,
      journeyId: journey.id,
      journeyTitle: journey.title,
    })),
  );
  const completedCount = todayActivities.filter(
    (activity) => activity.completedToday,
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Your journeys
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Keep moving in a direction that matters.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            A flexible place for goals, practices, and the person you are becoming.
          </p>
        </div>
        <Link
          href="/journeys/new"
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Start a journey
        </Link>
      </header>

      <section className="mt-8 overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-zinc-500" aria-hidden="true" />
              <h2 className="font-semibold">Today</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {completedCount} of {todayActivities.length} activities complete · move gently
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-zinc-100 text-sm font-semibold">
            {completedCount}/{todayActivities.length}
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {todayActivities.map((activity) => (
            <div
              key={`${activity.journeyId}-${activity.id}`}
              className="flex items-center gap-3 px-5 py-4 sm:px-6"
            >
              <button
                type="button"
                onClick={() => toggleActivity(activity.journeyId, activity.id)}
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
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    activity.completedToday ? "text-zinc-400 line-through" : "text-zinc-800"
                  }`}
                >
                  {activity.title}
                </p>
                <p className="mt-0.5 truncate text-[0.68rem] text-zinc-400">
                  {activity.journeyTitle} · {activity.frequency}
                </p>
              </div>
              <Link
                href={`/journeys/${activity.journeyId}`}
                className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-black"
                aria-label={`Open ${activity.journeyTitle}`}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              In progress
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Active journeys</h2>
          </div>
          <p className="text-xs text-zinc-400">{activeJourneys.length} active</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {activeJourneys.map((journey, index) => {
            const weekCompletions = journey.activities.reduce(
              (total, activity) =>
                total + activity.history.filter(Boolean).length,
              0,
            );
            const targetPercent = journey.target
              ? Math.min(100, (journey.target.current / journey.target.total) * 100)
              : null;

            return (
              <Link
                key={journey.id}
                href={`/journeys/${journey.id}`}
                className={`group flex min-h-72 flex-col justify-between rounded-[1.4rem] border p-5 transition-transform hover:-translate-y-0.5 sm:p-6 ${
                  index === 0
                    ? "border-black bg-black text-white"
                    : "border-zinc-200 bg-zinc-50 text-black hover:border-zinc-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid size-9 place-items-center rounded-full ${
                        index === 0 ? "bg-white text-black" : "bg-black text-white"
                      }`}
                    >
                      <Route className="size-4" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className={`size-4 transition-transform group-hover:translate-x-1 ${
                        index === 0 ? "text-white/60" : "text-zinc-400"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    className={`mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${
                      index === 0 ? "text-white/50" : "text-zinc-400"
                    }`}
                  >
                    {journey.kind === "measurable" ? "Measurable goal" : "Ongoing practice"}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.04em]">
                    {journey.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      index === 0 ? "text-white/65" : "text-zinc-500"
                    }`}
                  >
                    {journey.description}
                  </p>
                </div>

                <div className="mt-7">
                  {journey.target && targetPercent !== null ? (
                    <>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>
                          {journey.target.current} of {journey.target.total} {journey.target.unit}
                        </span>
                        <span>{Math.round(targetPercent)}%</span>
                      </div>
                      <div
                        className={`mt-2 h-1.5 overflow-hidden rounded-full ${
                          index === 0 ? "bg-white/20" : "bg-zinc-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            index === 0 ? "bg-white" : "bg-black"
                          }`}
                          style={{ width: `${targetPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span
                        className={`grid size-6 place-items-center rounded-full ${
                          index === 0 ? "bg-white/10" : "bg-white"
                        }`}
                      >
                        <Circle className="size-2.5" fill="currentColor" aria-hidden="true" />
                      </span>
                      {weekCompletions} thoughtful check-ins this week
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-zinc-100 lg:grid-cols-[1fr_280px]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            <Sparkles className="size-4" aria-hidden="true" />
            Reflect with Improism AI
          </div>
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            Progress is easier to understand when you pause long enough to notice it.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Review what is working, name what feels difficult, and receive a gentle sample reflection based on your journey activity.
          </p>
          <Link
            href={`/ai?journey=${activeJourneys[0]?.id ?? "calmer-mornings"}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <MessageCircleMore className="size-4" aria-hidden="true" />
            Review with AI
          </Link>
        </div>
        <div className="relative hidden overflow-hidden bg-black lg:block">
          <div className="absolute -right-12 -top-12 size-44 rounded-full border border-white/30" />
          <div className="absolute -right-4 top-0 size-28 rounded-full border border-white/20" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-sm leading-6 text-white/60">
              “Your consistency is growing most when the activity is easy to begin.”
            </p>
            <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em]">
              Sample insight
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
