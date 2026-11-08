"use client";

import {
  ArrowUpRight,
  Clock3,
  Home,
  Leaf,
  Menu,
  MessageCircleMore,
  PanelLeftClose,
  PenLine,
  Plus,
  Route,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useJourneys } from "@/components/journeys/journeys-provider";
import {
  conversations,
  posts,
  type ConversationRecord as Conversation,
  type MessageRecord as Message,
  type PostRecord,
} from "@/lib/mock-data";
import type { Journey } from "@/lib/journey-data";

type PostContext = Pick<PostRecord, "subject" | "title" | "excerpt" | "readTime">;

const suggestions = [
  "How do I know what deserves my attention?",
  "Can ambition and peace exist together?",
  "Help me think through a difficult decision",
  "What makes a life feel meaningful?",
];

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "AI", icon: Sparkles, href: "/ai", active: true },
  { label: "Journeys", icon: Route, href: "/journeys" },
  { label: "Profile", icon: UserRound, href: "/profile" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Improism home">
      <span className="grid size-9 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
        <Leaf className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[1.35rem] font-semibold tracking-[-0.045em]">Improism</span>
    </Link>
  );
}

function PrimaryNavigation({ onPlaceholder }: { onPlaceholder: (label: string) => void }) {
  return (
    <nav className="space-y-1.5" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const classes = `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
          item.active
            ? "bg-black text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
        }`;

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={classes}
              aria-current={item.active ? "page" : undefined}
            >
              <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onPlaceholder(item.label)}
            className={classes}
          >
            <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function ConversationHistory({
  activeId,
  onSelect,
  onNew,
}: {
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 p-4">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <PenLine className="size-4" aria-hidden="true" />
          New conversation
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Recent
        </p>
        <div className="mt-2 space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                activeId === conversation.id
                  ? "bg-white shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
                  : "hover:bg-white/70"
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-900">
                    {conversation.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">
                    {conversation.preview}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-[0.62rem] text-zinc-400">
                  {conversation.time}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 px-5 py-4">
        <p className="text-[0.68rem] leading-5 text-zinc-400">
          Conversations are mock data and are not saved yet.
        </p>
      </div>
    </div>
  );
}

function ReferencedPost({ post }: { post: PostContext }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
          <MessageCircleMore className="size-4" aria-hidden="true" />
          Discussing a post from your feed
        </div>
        <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {post.readTime}
        </div>
      </div>
      <div className="grid sm:grid-cols-[100px_1fr]">
        <div className="hidden place-items-center bg-black text-white sm:grid">
          <Leaf className="size-7" strokeWidth={1.6} aria-hidden="true" />
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {post.subject}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-6 tracking-[-0.025em]">
            {post.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{post.excerpt}</p>
        </div>
      </div>
    </div>
  );
}

function ReferencedJourney({ journey }: { journey: Journey }) {
  const completed = journey.activities.filter((activity) => activity.completedToday).length;
  return (
    <div className="mx-auto mb-8 max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
          <Route className="size-4" aria-hidden="true" />
          Reviewing a personal journey
        </div>
        <Link href={`/journeys/${journey.id}`} className="text-xs font-semibold text-zinc-500 hover:text-black">
          Open journey
        </Link>
      </div>
      <div className="grid sm:grid-cols-[100px_1fr]">
        <div className="hidden place-items-center bg-black text-white sm:grid">
          <Route className="size-7" strokeWidth={1.6} aria-hidden="true" />
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {journey.kind === "measurable" ? "Measurable journey" : "Ongoing journey"} · {completed}/{journey.activities.length} today
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-6 tracking-[-0.025em]">{journey.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{journey.goal}</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-black text-white">
          <Sparkles className="size-3.5" aria-hidden="true" />
        </span>
      )}
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-[0.92rem] leading-6 sm:max-w-[78%] sm:px-5 sm:py-4 ${
          isUser
            ? "rounded-br-md bg-black text-white"
            : "rounded-bl-md border border-zinc-200 bg-zinc-50 text-zinc-800"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-2 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Improism AI
      </p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl">
        What would you like to think through?
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500 sm:text-base">
        Explore an idea, untangle a decision, or look at a familiar question from a different angle.
      </p>

      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className="group flex min-h-20 items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium leading-5 transition-colors hover:border-black hover:bg-zinc-50"
          >
            <span>{suggestion}</span>
            <ArrowUpRight
              className="size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-black"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-zinc-200 bg-white px-3 pb-[max(5.25rem,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-[1.35rem] border border-zinc-300 bg-white p-2 pl-4 shadow-[0_10px_35px_rgba(0,0,0,0.07)] focus-within:border-black">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Message Improism AI…"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 outline-none placeholder:text-zinc-400"
            aria-label="Message Improism AI"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            aria-label="Send message"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-center text-[0.65rem] text-zinc-400">
          Prototype responses are local mock content. Improism AI can make mistakes.
        </p>
      </div>
    </div>
  );
}

function MobileNavigation({ onPlaceholder }: { onPlaceholder: (label: string) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="size-5" strokeWidth={item.active ? 2.3 : 1.8} aria-hidden="true" />
              {item.label}
            </>
          );
          const classes = `flex flex-col items-center gap-1 py-1 text-[0.65rem] font-medium ${
            item.active ? "text-black" : "text-zinc-500"
          }`;

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={classes}
              aria-current={item.active ? "page" : undefined}
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => onPlaceholder(item.label)}
              className={classes}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AiChat({
  initialPostId,
  initialConversationId,
  initialJourneyId,
}: {
  initialPostId?: string;
  initialConversationId?: string;
  initialJourneyId?: string;
}) {
  const { journeys } = useJourneys();
  const initialPost = initialPostId
    ? posts.find((post) => String(post.id) === initialPostId)
    : undefined;
  const initialConversation = initialConversationId
    ? conversations.find((conversation) => conversation.id === initialConversationId)
    : undefined;
  const initialJourney = initialJourneyId
    ? journeys.find((journey) => journey.id === initialJourneyId)
    : undefined;
  const [activeId, setActiveId] = useState<string | null>(
    initialConversation?.id ?? (initialPost ? "post-context" : initialJourney ? "journey-context" : null),
  );
  const [activeTitle, setActiveTitle] = useState(
    initialConversation?.title ?? (initialPost ? "Discussing a post" : initialJourney ? `Review: ${initialJourney.title}` : "New conversation"),
  );
  const [referencedPost, setReferencedPost] = useState<PostContext | undefined>(initialPost);
  const [referencedJourney, setReferencedJourney] = useState<Journey | undefined>(initialJourney);
  const [messages, setMessages] = useState<Message[]>(
    initialConversation
      ? initialConversation.messages
      : initialPost
      ? [
          {
            id: "post-welcome",
            role: "assistant",
            content:
              "Let’s explore this together. Which part of the post stayed with you, or where would you like to challenge its idea?",
          },
        ]
      : initialJourney
        ? [{
            id: "journey-welcome",
            role: "assistant",
            content: "I have your journey, plan, and recent activity in view. What would you like to understand—what is working, what feels difficult, or what to adjust next?",
          }]
        : [],
  );
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState("");

  function newConversation() {
    setActiveId(null);
    setActiveTitle("New conversation");
    setReferencedPost(undefined);
    setReferencedJourney(undefined);
    setMessages([]);
    setInput("");
    setShowHistory(false);
  }

  function selectConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    setActiveTitle(conversation.title);
    setReferencedPost(undefined);
    setReferencedJourney(undefined);
    setMessages(conversation.messages);
    setInput("");
    setShowHistory(false);
  }

  function sendMessage(prompt = input) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const now = Date.now();
    const userMessage: Message = {
      id: `user-${now}`,
      role: "user",
      content: trimmed,
    };
    const assistantMessage: Message = {
      id: `assistant-${now}`,
      role: "assistant",
      content:
        "A useful place to begin is to separate what you know from what you fear might be true. If you hold the question without rushing to solve it, what value or need seems to sit underneath it? This is a local prototype response; the reasoning model will be connected later.",
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setActiveId((current) => current ?? "local-conversation");
    setActiveTitle((current) =>
      current === "New conversation" ? trimmed.slice(0, 42) : current,
    );
    setInput("");
  }

  function showPlaceholder(label: string) {
    setNotice(`${label} is a prototype preview for now.`);
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-white text-black md:grid md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[190px_280px_minmax(0,1fr)]">
      <aside className="hidden h-dvh flex-col border-r border-zinc-200 px-5 py-7 md:flex">
        <Brand />
        <div className="mt-10">
          <PrimaryNavigation onPlaceholder={showPlaceholder} />
        </div>
        <div className="mt-auto rounded-2xl border border-zinc-200 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Improism AI
          </p>
          <p className="mt-2 text-sm font-medium leading-5">A place to think, question, and understand.</p>
          <p className="mt-2 text-[0.68rem] leading-5 text-zinc-400">Prototype · Local mock data</p>
        </div>
      </aside>

      <aside className="hidden h-dvh border-r border-zinc-200 lg:block">
        <ConversationHistory
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newConversation}
        />
      </aside>

      <main className="flex min-h-0 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 lg:hidden"
              aria-label="Open conversation history"
            >
              <Menu className="size-4.5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold sm:text-base">{activeTitle}</p>
              <p className="text-[0.66rem] text-zinc-400">
                {referencedPost ? "Post discussion" : referencedJourney ? "Journey review" : "Improism AI · Prototype"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={newConversation}
            className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold hover:border-black sm:px-4 sm:text-sm"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">New conversation</span>
            <span className="sm:hidden">New</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-6 sm:py-8">
          {messages.length === 0 && !referencedPost && !referencedJourney ? (
            <EmptyState onSuggestion={sendMessage} />
          ) : (
            <div className="mx-auto max-w-3xl">
              {referencedPost && <ReferencedPost post={referencedPost} />}
              {referencedJourney && <ReferencedJourney journey={referencedJourney} />}
              <div className="space-y-5">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          )}
        </div>

        <Composer value={input} onChange={setInput} onSend={() => sendMessage()} />
      </main>

      {showHistory && (
        <div className="absolute inset-0 z-50 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
            <div className="flex items-center gap-2.5">
              <PanelLeftClose className="size-4.5" aria-hidden="true" />
              <p className="font-semibold">Conversations</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="grid size-9 place-items-center rounded-full border border-zinc-200"
              aria-label="Close conversation history"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="h-[calc(100dvh-4rem)]">
            <ConversationHistory
              activeId={activeId}
              onSelect={selectConversation}
              onNew={newConversation}
            />
          </div>
        </div>
      )}

      <MobileNavigation onPlaceholder={showPlaceholder} />

      {notice && (
        <div
          className="fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-black px-4 py-3 text-sm text-white shadow-2xl md:bottom-6"
          role="status"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss message"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
