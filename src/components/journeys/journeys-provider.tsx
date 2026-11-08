"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  initialJourneys,
  type Journey,
  type JourneyActivity,
  type NewJourneyInput,
} from "@/lib/journey-data";

type JourneyUpdates = Pick<Journey, "title" | "description" | "goal"> &
  Partial<Pick<Journey, "deadline" | "target">>;

type JourneysContextValue = {
  journeys: Journey[];
  createJourney: (input: NewJourneyInput) => string;
  updateJourney: (journeyId: string, updates: JourneyUpdates) => void;
  addActivity: (
    journeyId: string,
    activity: Pick<JourneyActivity, "title" | "frequency">,
  ) => void;
  updateActivity: (
    journeyId: string,
    activityId: string,
    updates: Pick<JourneyActivity, "title" | "frequency">,
  ) => void;
  removeActivity: (journeyId: string, activityId: string) => void;
  toggleActivity: (journeyId: string, activityId: string) => void;
  addReflection: (journeyId: string, content: string) => void;
};

const JourneysContext = createContext<JourneysContextValue | null>(null);

const storageKey = "improism-journeys-v1";
let journeyState = initialJourneys;
let initialized = false;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) journeyState = JSON.parse(stored) as Journey[];
    } catch {
      journeyState = initialJourneys;
    }
  }
  return journeyState;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setJourneys(updater: (current: Journey[]) => Journey[]) {
  journeyState = updater(getSnapshot());
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(journeyState));
  }
  listeners.forEach((listener) => listener());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function JourneysProvider({ children }: { children: ReactNode }) {
  const journeys = useSyncExternalStore(subscribe, getSnapshot, () => initialJourneys);

  function createJourney(input: NewJourneyInput) {
    const baseId = slugify(input.title) || "new-journey";
    const existingIds = new Set(journeys.map((journey) => journey.id));
    let id = baseId;
    let suffix = 2;

    while (existingIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const journey: Journey = {
      id,
      ...input,
      activities: input.activities.map((activity, index) => ({
        id: `${id}-activity-${index + 1}`,
        ...activity,
        completedToday: false,
        history: [false, false, false, false, false, false, false],
      })),
      reflections: [],
      status: "active",
    };

    setJourneys((current) => [...current, journey]);
    return id;
  }

  function updateJourney(journeyId: string, updates: JourneyUpdates) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId ? { ...journey, ...updates } : journey,
      ),
    );
  }

  function addActivity(
    journeyId: string,
    activity: Pick<JourneyActivity, "title" | "frequency">,
  ) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              activities: [
                ...journey.activities,
                {
                  id: `${journeyId}-activity-${journey.activities.length + 1}-${Date.now()}`,
                  ...activity,
                  completedToday: false,
                  history: [false, false, false, false, false, false, false],
                },
              ],
            }
          : journey,
      ),
    );
  }

  function updateActivity(
    journeyId: string,
    activityId: string,
    updates: Pick<JourneyActivity, "title" | "frequency">,
  ) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              activities: journey.activities.map((activity) =>
                activity.id === activityId ? { ...activity, ...updates } : activity,
              ),
            }
          : journey,
      ),
    );
  }

  function removeActivity(journeyId: string, activityId: string) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              activities: journey.activities.filter(
                (activity) => activity.id !== activityId,
              ),
            }
          : journey,
      ),
    );
  }

  function toggleActivity(journeyId: string, activityId: string) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              activities: journey.activities.map((activity) => {
                if (activity.id !== activityId) return activity;
                const completedToday = !activity.completedToday;
                const history = [...activity.history];
                history[history.length - 1] = completedToday;
                return { ...activity, completedToday, history };
              }),
            }
          : journey,
      ),
    );
  }

  function addReflection(journeyId: string, content: string) {
    setJourneys((current) =>
      current.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              reflections: [
                {
                  id: `${journeyId}-reflection-${Date.now()}`,
                  date: "Today",
                  content,
                },
                ...journey.reflections,
              ],
            }
          : journey,
      ),
    );
  }

  const value = {
    journeys,
    createJourney,
    updateJourney,
    addActivity,
    updateActivity,
    removeActivity,
    toggleActivity,
    addReflection,
  };

  return <JourneysContext.Provider value={value}>{children}</JourneysContext.Provider>;
}

export function useJourneys() {
  const context = useContext(JourneysContext);
  if (!context) {
    throw new Error("useJourneys must be used within JourneysProvider");
  }
  return context;
}
