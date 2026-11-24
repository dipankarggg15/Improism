export type JourneyKind = "measurable" | "ongoing";

export type JourneyActivity = {
  id: string;
  title: string;
  frequency: string;
  completedToday: boolean;
  history: boolean[];
};

export type JourneyReflection = {
  id: string;
  date: string;
  content: string;
};

export type Journey = {
  id: string;
  title: string;
  description: string;
  goal: string;
  kind: JourneyKind;
  target?: { current: number; total: number; unit: string };
  deadline?: string;
  activities: JourneyActivity[];
  reflections: JourneyReflection[];
  status: "active" | "paused";
};

export type NewJourneyInput = {
  title: string;
  description: string;
  goal: string;
  kind: JourneyKind;
  target?: Journey["target"];
  deadline?: string;
  activities: Array<Pick<JourneyActivity, "title" | "frequency">>;
};
