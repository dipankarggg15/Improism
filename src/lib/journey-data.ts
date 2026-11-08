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
  target?: {
    current: number;
    total: number;
    unit: string;
  };
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

export const initialJourneys: Journey[] = [
  {
    id: "calmer-mornings",
    title: "Build calmer mornings",
    description:
      "Create a morning rhythm that feels spacious, intentional, and easier to return to.",
    goal: "Begin most days with attention instead of urgency.",
    kind: "ongoing",
    activities: [
      {
        id: "morning-no-phone",
        title: "Keep the first 10 minutes phone-free",
        frequency: "Daily",
        completedToday: false,
        history: [true, true, false, true, true, false, false],
      },
      {
        id: "morning-note",
        title: "Write one intention for the day",
        frequency: "Weekdays",
        completedToday: true,
        history: [true, false, true, true, true, false, true],
      },
      {
        id: "morning-walk",
        title: "Take a quiet walk outside",
        frequency: "3 times a week",
        completedToday: false,
        history: [false, true, false, true, false, true, false],
      },
    ],
    reflections: [
      {
        id: "morning-reflection-1",
        date: "6 Nov",
        content:
          "The phone-free start changes the tone of the whole morning. I want to make the walk easier by preparing shoes the night before.",
      },
    ],
    status: "active",
  },
  {
    id: "finish-design-course",
    title: "Finish the design course",
    description:
      "Complete the remaining lessons and turn the exercises into one thoughtful case study.",
    goal: "Finish all 12 modules and publish a small case study.",
    kind: "measurable",
    target: {
      current: 7,
      total: 12,
      unit: "modules",
    },
    deadline: "2026-12-20",
    activities: [
      {
        id: "course-lesson",
        title: "Complete one lesson",
        frequency: "4 times a week",
        completedToday: false,
        history: [true, true, false, true, false, false, false],
      },
      {
        id: "course-notes",
        title: "Summarize the lesson in my own words",
        frequency: "After each lesson",
        completedToday: false,
        history: [true, false, false, true, false, false, false],
      },
    ],
    reflections: [
      {
        id: "course-reflection-1",
        date: "4 Nov",
        content:
          "Short sessions are working better than waiting for a free afternoon. The case study is becoming clearer as I take notes.",
      },
    ],
    status: "active",
  },
  {
    id: "better-conversations",
    title: "Become a better listener",
    description:
      "Practice staying curious in conversations instead of preparing the next response.",
    goal: "Make close relationships feel more heard, understood, and unhurried.",
    kind: "ongoing",
    activities: [
      {
        id: "listen-question",
        title: "Ask one genuine follow-up question",
        frequency: "During meaningful conversations",
        completedToday: true,
        history: [false, true, true, false, true, false, true],
      },
      {
        id: "listen-reflect",
        title: "Reflect on one conversation",
        frequency: "Twice a week",
        completedToday: false,
        history: [false, false, true, false, false, true, false],
      },
    ],
    reflections: [],
    status: "active",
  },
];
