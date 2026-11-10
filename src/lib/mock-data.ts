export type PostTheme = "forest" | "clay" | "night" | "lemon" | "sky" | "lilac";

export type SubjectRecord = {
  name: string;
  description: string;
};

export type PostRecord = {
  id: number;
  subject: string;
  eyebrow: string;
  title: string;
  excerpt: string;
  readTime: string;
  visualTitle: string;
  visualNote: string;
  theme: PostTheme;
};

export type MessageRecord = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export type ConversationRecord = {
  id: string;
  title: string;
  preview: string;
  time: string;
  messages: MessageRecord[];
};

export const subjects: SubjectRecord[] = [
  { name: "Personal Growth", description: "Habits, identity, confidence, and self-awareness." },
  { name: "Philosophy", description: "Questions and ideas for living with intention." },
  { name: "Business", description: "Better systems, judgment, leadership, and work." },
  { name: "Health", description: "Sustainable thinking about mind and body." },
  { name: "Relationships", description: "Connection, communication, and belonging." },
  { name: "Creativity", description: "Original thinking and making meaningful things." },
  { name: "Science", description: "Useful discoveries about people and the world." },
  { name: "Money", description: "Clearer decisions about earning, saving, and enough." },
  { name: "Mindfulness", description: "Attention, presence, reflection, and everyday awareness." },
];

export const posts: PostRecord[] = [
  {
    id: 1,
    subject: "Personal Growth",
    eyebrow: "A practice for becoming",
    title: "Your identity is built in the minutes nobody applauds",
    excerpt: "The private choices that feel too small to matter are often the ones quietly deciding who you become.",
    readTime: "4 min read",
    visualTitle: "The quiet work compounds.",
    visualNote: "Consistency is a form of self-trust.",
    theme: "forest",
  },
  {
    id: 2,
    subject: "Philosophy",
    eyebrow: "A question worth keeping",
    title: "A meaningful life is not the same as a comfortable one",
    excerpt: "Comfort asks what will make this moment easier. Meaning asks what will make this life more honest.",
    readTime: "6 min read",
    visualTitle: "What is this season asking of you?",
    visualNote: "Not every difficulty is a detour.",
    theme: "clay",
  },
  {
    id: 3,
    subject: "Health",
    eyebrow: "A gentler definition of progress",
    title: "Rest is a skill, not a reward you have to earn",
    excerpt: "Recovery is part of the work. The strongest routines make room for the nervous system to feel safe again.",
    readTime: "5 min read",
    visualTitle: "Pause before your body asks twice.",
    visualNote: "Recovery makes effort sustainable.",
    theme: "sky",
  },
  {
    id: 4,
    subject: "Business",
    eyebrow: "Systems over intensity",
    title: "Build a process that can survive your motivation",
    excerpt: "A useful system does not demand your best day. It gives your ordinary days enough structure to keep moving.",
    readTime: "7 min read",
    visualTitle: "Make the next step obvious.",
    visualNote: "Good systems reduce negotiation.",
    theme: "lemon",
  },
  {
    id: 5,
    subject: "Personal Growth",
    eyebrow: "Try this today",
    title: "The two-minute reset for a scattered mind",
    excerpt: "Name what has your attention, choose what deserves it next, and make the first action impossibly small.",
    readTime: "3 min read",
    visualTitle: "Notice. Choose. Begin.",
    visualNote: "Clarity often follows movement.",
    theme: "lilac",
  },
  {
    id: 6,
    subject: "Philosophy",
    eyebrow: "On the shape of a life",
    title: "What if attention is your real autobiography?",
    excerpt: "Your days are not only what happened to you. They are also what you repeatedly decided was worth noticing.",
    readTime: "5 min read",
    visualTitle: "A life follows the light of attention.",
    visualNote: "What you notice, you strengthen.",
    theme: "night",
  },
  {
    id: 7,
    subject: "Relationships",
    eyebrow: "The courage to stay curious",
    title: "Listening changes when understanding matters more than winning",
    excerpt: "A good question can make a conversation safer than a perfect argument ever could.",
    readTime: "4 min read",
    visualTitle: "Listen for the person beneath the position.",
    visualNote: "Curiosity leaves room for connection.",
    theme: "clay",
  },
  {
    id: 8,
    subject: "Creativity",
    eyebrow: "Make before you judge",
    title: "Your first idea does not need to carry the whole project",
    excerpt: "Creative momentum begins when early work is allowed to be incomplete, awkward, and useful only as a doorway.",
    readTime: "5 min read",
    visualTitle: "Begin with something that can change.",
    visualNote: "Drafts are invitations, not verdicts.",
    theme: "lilac",
  },
];

export const conversations: ConversationRecord[] = [
  {
    id: "ambition",
    title: "Ambition and contentment",
    preview: "Can both exist without cancelling each other out?",
    time: "9:42 PM",
    messages: [
      { id: "a1", role: "user", content: "Can ambition and contentment coexist, or does one always weaken the other?" },
      { id: "a2", role: "assistant", content: "They can coexist when ambition is an expression of aliveness rather than a verdict on your current worth. Contentment says this moment is enough for me to belong in. Ambition says I am still curious about what I could become." },
      { id: "a3", role: "user", content: "How can I tell which kind of ambition is driving me?" },
      { id: "a4", role: "assistant", content: "Notice what happens emotionally when progress is slow. Healthy ambition can tolerate a quiet season without turning it into self-rejection." },
    ],
  },
  {
    id: "conversation",
    title: "A difficult conversation",
    preview: "How to be honest without becoming harsh.",
    time: "Yesterday",
    messages: [
      { id: "c1", role: "user", content: "I need to have a difficult conversation, but I am worried honesty will sound harsh." },
      { id: "c2", role: "assistant", content: "Try separating clarity from punishment. You can name what happened, explain its impact, and ask for a change without trying to make the other person feel small." },
    ],
  },
  {
    id: "attention",
    title: "Reclaiming my attention",
    preview: "Small boundaries for a less scattered day.",
    time: "Mon",
    messages: [
      { id: "t1", role: "user", content: "My attention feels fragmented all day. Where should I begin?" },
      { id: "t2", role: "assistant", content: "Begin with one protected edge rather than an entirely new life. Choose twenty minutes and remove one source of interruption." },
    ],
  },
  {
    id: "direction",
    title: "Choosing a direction",
    preview: "What to do when several paths feel meaningful.",
    time: "2 Nov",
    messages: [
      { id: "d1", role: "user", content: "How do I choose when several paths all feel meaningful?" },
      { id: "d2", role: "assistant", content: "Ask which direction deserves a real season of your attention. Commitment can give one possibility enough time to become knowable." },
    ],
  },
];
