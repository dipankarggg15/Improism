"use client";

import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Home,
  Leaf,
  MessageCircleMore,
  Plus,
  Route,
  Share2,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useImproism } from "@/components/improism-provider";
import { useJourneys } from "@/components/journeys/journeys-provider";
import { conversations, posts, type PostRecord } from "@/lib/mock-data";

const themeClasses: Record<PostRecord["theme"], string> = {
  forest: "bg-black text-white",
  clay: "bg-zinc-200 text-black",
  night: "bg-zinc-900 text-white",
  lemon: "bg-zinc-100 text-black",
  sky: "bg-zinc-300 text-black",
  lilac: "bg-zinc-700 text-white",
};

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "AI", icon: Sparkles },
  { label: "Journeys", icon: Route },
  { label: "Profile", icon: UserRound },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Improism">
      <div className="grid size-9 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
        <Leaf className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
      </div>
      <span className="text-[1.35rem] font-semibold tracking-[-0.045em]">
        Improism
      </span>
    </div>
  );
}

function Navigation({ onPlaceholder }: { onPlaceholder: (label: string) => void }) {
  return (
    <nav className="space-y-1.5" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => !item.active && onPlaceholder(item.label)}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
              item.active
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
            }`}
            aria-current={item.active ? "page" : undefined}
          >
            <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function DailyAllowance({ selectedSubject, subjectCount }: { selectedSubject: string; subjectCount: number }) {
  const isForYou = selectedSubject === "For You";
  const current = isForYou ? 18 : 4;
  const limit = isForYou ? subjectCount * 10 : 10;
  const width = `${(current / limit) * 100}%`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Today&apos;s reading
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {current} of up to {limit} posts
          </p>
        </div>
        <span className="grid size-8 place-items-center rounded-full bg-zinc-100 text-black">
          <Compass className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-black transition-[width] duration-300"
          style={{ width }}
        />
      </div>
      <p className="mt-2.5 text-[0.72rem] leading-5 text-zinc-500">
        {isForYou
          ? `Based on ${subjectCount} selected subjects · up to 10 each`
          : `Up to 10 ${selectedSubject.toLowerCase()} posts each day`}
      </p>
    </div>
  );
}

function SubjectFilters({
  subjects,
  selected,
  onSelect,
}: {
  subjects: string[];
  selected: string;
  onSelect: (subject: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 sm:px-0" role="tablist">
      {subjects.map((subject) => (
        <button
          key={subject}
          type="button"
          role="tab"
          aria-selected={selected === subject}
          onClick={() => onSelect(subject)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selected === subject
              ? "border-black bg-black text-white"
              : "border-zinc-300 bg-white text-zinc-600 hover:border-black hover:text-black"
          }`}
        >
          {subject}
        </button>
      ))}
    </div>
  );
}

function PostVisual({ post }: { post: PostRecord }) {
  return (
    <div
      className={`relative isolate aspect-[16/10] overflow-hidden ${themeClasses[post.theme]}`}
    >
      <div className="absolute -right-16 -top-20 size-56 rounded-full border border-current opacity-20" />
      <div className="absolute -right-6 -top-10 size-36 rounded-full border border-current opacity-25" />
      <div className="absolute -bottom-20 -left-16 size-52 rounded-full bg-white/10 blur-sm" />
      <div className="absolute left-[14%] top-[18%] h-[44%] w-px rotate-[18deg] bg-current opacity-25" />
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <span className="w-fit rounded-full border border-current/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] opacity-80">
          Improism note · {String(post.id).padStart(2, "0")}
        </span>
        <div>
          <p className="max-w-[19rem] text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.045em] sm:max-w-[25rem] sm:text-[2.35rem]">
            {post.visualTitle}
          </p>
          <p className="mt-3 text-xs font-medium opacity-70 sm:text-sm">
            {post.visualNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  saved,
  onSave,
  onDiscuss,
  onPlaceholder,
}: {
  post: PostRecord;
  saved: boolean;
  onSave: (id: number) => void;
  onDiscuss: (id: number) => void;
  onPlaceholder: (label: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.45rem] border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-black">
            <span className="size-1.5 rounded-full bg-black" />
            {post.subject}
          </div>
          <p className="mt-1 text-[0.7rem] text-zinc-500">{post.eyebrow}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[0.72rem] text-zinc-500">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {post.readTime}
        </div>
      </div>

      <PostVisual post={post} />

      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <h2 className="text-[1.45rem] font-semibold leading-[1.16] tracking-[-0.035em] text-black sm:text-[1.7rem]">
          {post.title}
        </h2>
        <p className="mt-3 text-[0.92rem] leading-6 text-zinc-600 sm:text-[0.97rem]">
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={() => onDiscuss(post.id)}
            className="flex items-center gap-2 rounded-full bg-black px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:text-sm"
          >
            <MessageCircleMore className="size-4" aria-hidden="true" />
            Discuss with AI
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSave(post.id)}
              className={`grid size-9 place-items-center rounded-full transition-colors ${
                saved
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
              }`}
              aria-label={saved ? "Remove from saved posts" : "Save post"}
              title={saved ? "Saved" : "Save"}
            >
              <Bookmark
                className="size-[1.1rem]"
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => onPlaceholder("Sharing")}
              className="grid size-9 place-items-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black"
              aria-label="Share post"
              title="Share"
            >
              <Share2 className="size-[1.1rem]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DiscussionPreview({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`rounded-[1.35rem] border border-black bg-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.12)] ${
        compact ? "p-5" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-white/10">
            <Sparkles className="size-4 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-400">
              Continue thinking
            </p>
            <p className="mt-0.5 text-sm font-medium">Recent AI discussions</p>
          </div>
        </div>
        <ArrowUpRight className="size-4 text-white/55" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2.5">
        {conversations.slice(0, 2).map((conversation) => (
          <Link
            key={conversation.id}
            href={`/ai?conversation=${conversation.id}`}
            className="flex w-full items-center justify-between rounded-xl bg-white/[0.07] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.11]"
          >
            <span>
              <span className="block text-sm font-medium leading-5">{conversation.title}</span>
              <span className="mt-0.5 block text-[0.68rem] text-white/45">
                {conversation.messages.length} messages · {conversation.time}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-white/35" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[0.68rem] text-white/40">Continue in Improism AI</p>
    </section>
  );
}

function JourneyPreview() {
  const { journeys } = useJourneys();
  const journey = journeys.find((item) => item.status === "active");

  if (!journey) return null;

  const completionCount = journey.activities.reduce(
    (total, activity) => total + activity.history.filter(Boolean).length,
    0,
  );
  const possible = Math.max(1, journey.activities.length * 7);
  const progress = Math.round((completionCount / possible) * 100);

  return (
    <Link href={`/journeys/${journey.id}`} className="block rounded-[1.35rem] border border-zinc-200 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.05)] transition-colors hover:border-zinc-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-zinc-100 text-black">
            <Target className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current journey
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">
              {journey.title}
            </p>
          </div>
        </div>
        <ChevronRight className="size-4 text-zinc-400" aria-hidden="true" />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{completionCount} thoughtful check-ins this week</span>
        <span className="font-medium text-zinc-700">{progress}%</span>
      </div>
      <div className="mt-4 rounded-xl bg-zinc-100 px-3.5 py-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-zinc-500">
          Today&apos;s next step
        </p>
        <p className="mt-1 text-sm text-zinc-700">
          {journey.activities.find((activity) => !activity.completedToday)?.title ?? "Today is complete—take a moment to notice it."}
        </p>
      </div>
      <p className="mt-3 text-[0.68rem] text-zinc-400">Open journey</p>
    </Link>
  );
}

function DiscoverSubjects({ onAdd }: { onAdd: (subject: string) => void }) {
  return (
    <section className="rounded-[1.35rem] border border-zinc-200 bg-zinc-100 p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-white text-black">
          <Compass className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Broaden your feed
          </p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900">Discover subjects</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {["Creativity", "Science", "Money"].map((subject) => (
          <button
            key={subject}
            type="button"
            onClick={() => onAdd(subject)}
            className="flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200"
          >
            {subject}
            <Plus className="size-4 text-black" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Notice({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white shadow-2xl md:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-black">
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="grid size-7 shrink-0 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss message"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function HomeFeed() {
  const router = useRouter();
  const { selectedSubjects, savedPostIds, toggleSavedPost, toggleSubject } = useImproism();
  const [selectedSubject, setSelectedSubject] = useState("For You");
  const [notice, setNotice] = useState("");
  const subjectFilters = ["For You", ...selectedSubjects];

  const filteredPosts = useMemo(
    () =>
      selectedSubject === "For You"
        ? posts.filter((post) => selectedSubjects.includes(post.subject))
        : posts.filter((post) => post.subject === selectedSubject),
    [selectedSubject, selectedSubjects],
  );

  function toggleSaved(postId: number) {
    const isSaved = savedPostIds.includes(postId);
    toggleSavedPost(postId);
    setNotice(isSaved ? "Removed from your saved posts." : "Saved for later.");
  }

  function showPlaceholder(label: string) {
    setNotice(`${label} is a prototype preview for now.`);
  }

  async function addSubject(subject: string) {
    if (selectedSubjects.includes(subject)) {
      setNotice(`${subject} is already in your feed.`);
      return;
    }
    try {
      await toggleSubject(subject);
      setNotice(`${subject} added to your feed.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update your subjects.");
    }
  }

  function navigateFromHome(label: string) {
    if (label === "AI") {
      router.push("/ai");
      return;
    }
    if (label === "Journeys") {
      router.push("/journeys");
      return;
    }
    if (label === "Profile") {
      router.push("/profile");
      return;
    }
    showPlaceholder(label);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="grid size-9 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-600"
            aria-label="Open profile"
          >
            <UserRound className="size-4.5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1260px] grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,650px)_290px] xl:grid-cols-[210px_minmax(0,680px)_310px]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-zinc-200 px-5 py-7 md:flex">
          <Brand />
          <div className="mt-10">
            <Navigation onPlaceholder={navigateFromHome} />
          </div>
          <div className="mt-auto">
            <DailyAllowance selectedSubject={selectedSubject} subjectCount={selectedSubjects.length} />
            <p className="mt-4 px-2 text-[0.67rem] leading-5 text-zinc-400">
              A little better, a little more yourself.
            </p>
          </div>
        </aside>

        <main className="min-w-0 border-r-0 border-zinc-200 pb-24 md:border-r md:pb-12">
          <div className="px-4 pb-6 pt-7 sm:px-6 md:pt-9 lg:px-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Your daily perspective
                </p>
                <h1 className="mt-2 max-w-lg text-[2rem] font-semibold leading-[1.03] tracking-[-0.055em] sm:text-[2.55rem]">
                  Ideas worth carrying into your day.
                </h1>
              </div>
              <div className="hidden rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 sm:block">
                Sunday · 8 Nov
              </div>
            </div>

            <div className="mt-5 md:hidden">
              <DailyAllowance selectedSubject={selectedSubject} subjectCount={selectedSubjects.length} />
            </div>
          </div>

          <div className="sticky top-[65px] z-30 border-y border-zinc-200 bg-white/95 pt-3 backdrop-blur md:top-0">
            <SubjectFilters subjects={subjectFilters} selected={selectedSubject} onSelect={setSelectedSubject} />
          </div>

          <div className="space-y-5 px-4 pt-5 sm:px-6 lg:px-7">
            {filteredPosts.map((post, index) => (
              <div key={post.id} className="space-y-5">
                <PostCard
                  post={post}
                  saved={savedPostIds.includes(post.id)}
                  onSave={toggleSaved}
                  onDiscuss={(postId) => router.push(`/ai?post=${postId}`)}
                  onPlaceholder={showPlaceholder}
                />

                {index === 0 && (
                  <div className="lg:hidden">
                    <DiscussionPreview />
                  </div>
                )}
                {index === 1 && (
                  <div className="lg:hidden">
                    <JourneyPreview />
                  </div>
                )}
                {index === 2 && (
                  <div className="lg:hidden">
                    <DiscoverSubjects onAdd={addSubject} />
                  </div>
                )}
              </div>
            ))}

            <div className="rounded-[1.35rem] border border-dashed border-zinc-300 px-6 py-10 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-zinc-100 text-black">
                <Leaf className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-base font-semibold">
                {filteredPosts.length ? "You’re caught up for this preview" : "No posts in this subject yet"}
              </h2>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-zinc-500">
                {filteredPosts.length
                  ? "Your full daily feed can include up to 10 posts from each selected subject."
                  : "Follow another subject from Profile or choose For You to continue reading."}
              </p>
            </div>
          </div>
        </main>

        <aside className="sticky top-0 hidden h-screen overflow-y-auto px-5 py-7 lg:block xl:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Your space
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Continue where you left off</h2>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <DiscussionPreview compact />
            <JourneyPreview />
            <DiscoverSubjects onAdd={(subject) => void addSubject(subject)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 px-1 text-[0.66rem] text-zinc-400">
            <button type="button" onClick={() => showPlaceholder("About")}>About</button>
            <button type="button" onClick={() => showPlaceholder("Privacy")}>Privacy</button>
            <button type="button" onClick={() => showPlaceholder("Feedback")}>Feedback</button>
            <span>© 2026 Improism</span>
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => !item.active && navigateFromHome(item.label)}
                className={`flex flex-col items-center gap-1 py-1 text-[0.65rem] font-medium ${
                  item.active ? "text-black" : "text-zinc-500"
                }`}
                aria-current={item.active ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={item.active ? 2.3 : 1.8} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {notice && <Notice message={notice} onClose={() => setNotice("")} />}
    </div>
  );
}
