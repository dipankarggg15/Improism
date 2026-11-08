"use client";

import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Download,
  Edit3,
  Globe2,
  Home,
  Leaf,
  LockKeyhole,
  LogOut,
  MessageCircleMore,
  Monitor,
  Moon,
  Plus,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useImproism } from "@/components/improism-provider";
import { useJourneys } from "@/components/journeys/journeys-provider";
import { conversations, posts, subjects as allSubjects } from "@/lib/mock-data";
import { logout } from "@/app/auth/actions";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "AI", icon: Sparkles, href: "/ai" },
  { label: "Journeys", icon: Route, href: "/journeys" },
  { label: "Profile", icon: UserRound, href: "/profile", active: true },
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

function Section({
  id,
  title,
  description,
  children,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section id={id} className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-black" : "bg-zinc-200"
      }`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail: string;
  action: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-4 last:border-b-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-100">
        <Icon className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{detail}</p>
      </div>
      {action}
    </div>
  );
}

export function ProfileSettings() {
  const {
    displayName,
    bio,
    selectedSubjects,
    savedPostIds,
    theme,
    timezone,
    notifications,
    toggleSubject,
    toggleSavedPost,
    updateProfile,
    setTheme,
    setTimezone,
    toggleNotification,
    accountEmail,
    accountCreatedAt,
  } = useImproism();
  const { journeys } = useJourneys();
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id));
  const activeJourneys = journeys.filter((journey) => journey.status === "active");

  const dailyAllowance = selectedSubjects.length * 10;
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [displayName],
  );

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;
    try {
      await updateProfile(nextName, draftBio.trim());
      setEditing(false);
      setNotice("Profile changes saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save profile changes.");
    }
  }

  function removeSavedPost(id: number) {
    toggleSavedPost(id);
    setNotice("Removed from your saved posts.");
  }

  async function handleSubjectToggle(name: string) {
    try {
      await toggleSubject(name);
      setNotice("Subject preferences updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update your subjects.");
    }
  }

  function placeholder(message: string) {
    setNotice(`${message} will be available when accounts are connected.`);
  }

  return (
    <div className="h-dvh overflow-hidden bg-white text-black md:grid md:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="hidden h-dvh flex-col border-r border-zinc-200 px-5 py-7 md:flex">
        <Brand />
        <nav className="mt-10 space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                }`}
              >
                <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-zinc-200 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Your Improism
          </p>
          <p className="mt-2 text-sm font-medium leading-5">
            Shape what you read and how Improism supports you.
          </p>
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto pb-24 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 md:px-8 md:py-10">
          <header className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Your space
              </p>
              <h1 className="mt-2 text-[2.1rem] font-semibold leading-none tracking-[-0.055em] sm:text-[2.8rem]">
                Profile & settings
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Make Improism feel more like yours, from the ideas in your feed to the pace of your notifications.
              </p>
            </div>
            <Settings2 className="hidden size-7 text-zinc-300 sm:block" strokeWidth={1.5} aria-hidden="true" />
          </header>

          <div className="mt-8 overflow-hidden rounded-[1.6rem] bg-black text-white">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="grid size-20 shrink-0 place-items-center rounded-full border border-white/20 bg-white text-xl font-semibold text-black sm:size-24 sm:text-2xl">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{displayName}</h2>
                  <span className="rounded-full border border-white/20 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/60">
                    Private profile
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {accountEmail ?? "Your Improism account"}
                  {accountCreatedAt && ` · Member since ${new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(accountCreatedAt))}`}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{bio || "Add a short introduction about yourself."}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!editing) {
                    setDraftName(displayName);
                    setDraftBio(bio);
                  }
                  setEditing((current) => !current);
                }}
                className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                {editing ? <X className="size-4" aria-hidden="true" /> : <Edit3 className="size-4" aria-hidden="true" />}
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>
            {editing && (
              <form onSubmit={saveProfile} className="grid gap-4 border-t border-white/15 p-6 sm:grid-cols-2 sm:p-8">
                <label className="text-xs font-semibold text-white/70">
                  Display name
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/60"
                  />
                </label>
                <label className="text-xs font-semibold text-white/70">
                  About you
                  <input
                    value={draftBio}
                    onChange={(event) => setDraftBio(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/60"
                  />
                </label>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black sm:col-span-2 sm:justify-self-end">
                  <Check className="size-4" aria-hidden="true" />
                  Save changes
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              <Section
                id="subjects"
                title="My subjects"
                description="Choose the perspectives that shape your daily feed."
                action={
                  <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-2 text-right">
                    <p className="text-xs font-semibold">Up to {dailyAllowance} posts/day</p>
                  </div>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {allSubjects.map((subject) => {
                    const followed = selectedSubjects.includes(subject.name);
                    return (
                      <div key={subject.name} className="flex min-h-32 flex-col rounded-2xl border border-zinc-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid size-9 place-items-center rounded-full bg-zinc-100">
                            <Leaf className="size-4" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleSubjectToggle(subject.name)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                              followed ? "bg-black text-white" : "border border-zinc-300 hover:border-black"
                            }`}
                            aria-pressed={followed}
                          >
                            {followed ? <Check className="size-3.5" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
                            {followed ? "Following" : "Follow"}
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-semibold">{subject.name}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{subject.description}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs leading-5 text-zinc-500">
                  Each selected subject can add up to 10 fresh posts to your feed every day. For You mixes them into one stream.
                </p>
              </Section>

              <Section
                id="saved"
                title="Saved posts"
                description="Ideas you kept for another moment."
                action={<span className="text-xs font-medium text-zinc-400">{savedPosts.length} saved</span>}
              >
                {savedPosts.length ? (
                  <div className="space-y-2">
                    {savedPosts.map((post) => (
                      <article key={post.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-black text-white">
                          <Bookmark className="size-4.5 fill-current" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{post.subject} · {post.readTime}</p>
                          <h3 className="mt-1 text-sm font-semibold leading-5">{post.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSavedPost(post.id)}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-black"
                          aria-label={`Remove ${post.title} from saved posts`}
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 px-5 py-9 text-center">
                    <Bookmark className="mx-auto size-5 text-zinc-400" aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold">Your saved space is clear</p>
                    <p className="mt-1 text-xs text-zinc-500">Bookmark a post from Home to keep it here.</p>
                  </div>
                )}
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="My activity" description="A quiet snapshot of where you have been thinking and growing.">
                <div className="space-y-3">
                  <Link href={`/ai?conversation=${conversations[0]?.id ?? "ambition"}`} className="group flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 hover:bg-zinc-100">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white">
                      <MessageCircleMore className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-500">{conversations.length} recent AI conversations</p>
                      <p className="mt-0.5 truncate text-sm font-semibold">{conversations[0]?.title}</p>
                    </div>
                    <ChevronRight className="size-4 text-zinc-400 group-hover:text-black" aria-hidden="true" />
                  </Link>
                  <Link href={activeJourneys[0] ? `/journeys/${activeJourneys[0].id}` : "/journeys/new"} className="group flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 hover:bg-zinc-100">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-zinc-300 bg-white">
                      <Route className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-500">{activeJourneys.length} active journeys</p>
                      <p className="mt-0.5 truncate text-sm font-semibold">{activeJourneys[0]?.title ?? "Start a journey"}</p>
                    </div>
                    <ChevronRight className="size-4 text-zinc-400 group-hover:text-black" aria-hidden="true" />
                  </Link>
                </div>
              </Section>

              <Section title="Preferences" description="These choices are stored locally in this prototype.">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Theme</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-zinc-100 p-1">
                    {[
                      { name: "Light", icon: Sun },
                      { name: "Dark", icon: Moon },
                      { name: "System", icon: Monitor },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => setTheme(option.name)}
                          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold ${
                            theme === option.name ? "bg-white text-black shadow-sm" : "text-zinc-500"
                          }`}
                          aria-pressed={theme === option.name}
                        >
                          <Icon className="size-3.5" aria-hidden="true" />
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="mt-5 block text-xs font-semibold text-zinc-500">
                  Timezone
                  <span className="relative mt-2 flex items-center">
                    <Globe2 className="pointer-events-none absolute left-3 size-4 text-zinc-400" aria-hidden="true" />
                    <select
                      value={timezone}
                      onChange={(event) => setTimezone(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-9 text-sm font-medium text-black outline-none focus:border-black"
                    >
                      <option value="Asia/Kolkata">India · Kolkata (GMT+5:30)</option>
                      <option value="Europe/London">United Kingdom · London</option>
                      <option value="America/New_York">United States · New York</option>
                      <option value="Asia/Singapore">Singapore</option>
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 size-4 rotate-90 text-zinc-400" aria-hidden="true" />
                  </span>
                </label>
                <div className="mt-5 border-t border-zinc-200 pt-2">
                  {[
                    { key: "daily" as const, label: "Daily feed", detail: "A gentle reminder when fresh posts arrive." },
                    { key: "journeys" as const, label: "Journey reminders", detail: "Reminders for activities you planned." },
                    { key: "reflections" as const, label: "Reflection prompts", detail: "Occasional questions worth sitting with." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-4 py-3">
                      <Bell className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.detail}</p>
                      </div>
                      <Toggle
                        checked={notifications[item.key]}
                        onChange={() => toggleNotification(item.key)}
                        label={`Toggle ${item.label}`}
                      />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Account & privacy" description="Your session and profile are protected by Supabase authentication.">
                <SettingRow
                  icon={LogOut}
                  title="Log out"
                  detail="End your session on this device."
                  action={<form action={logout}><button type="submit" className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:border-black">Log out</button></form>}
                />
                <SettingRow
                  icon={LockKeyhole}
                  title="Sign-in & security"
                  detail="Reset your password securely by email."
                  action={<Link href="/forgot-password" className="grid size-9 place-items-center rounded-full hover:bg-zinc-100" aria-label="Open security settings"><ChevronRight className="size-4" aria-hidden="true" /></Link>}
                />
                <SettingRow
                  icon={ShieldCheck}
                  title="Privacy"
                  detail="Control how future personalization uses your activity."
                  action={<button type="button" onClick={() => placeholder("Privacy controls")} className="grid size-9 place-items-center rounded-full hover:bg-zinc-100" aria-label="Open privacy controls"><ChevronRight className="size-4" aria-hidden="true" /></button>}
                />
                <SettingRow
                  icon={Download}
                  title="Download your data"
                  detail="Export a copy of your future account data."
                  action={<button type="button" onClick={() => placeholder("Data export")} className="grid size-9 place-items-center rounded-full hover:bg-zinc-100" aria-label="Download your data"><ChevronRight className="size-4" aria-hidden="true" /></button>}
                />
                <SettingRow
                  icon={Trash2}
                  title="Delete account"
                  detail="This prototype will never delete anything."
                  action={<button type="button" onClick={() => placeholder("Account deletion")} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:border-black">Unavailable</button>}
                />
              </Section>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} aria-current={item.active ? "page" : undefined} className={`flex flex-col items-center gap-1 py-1 text-[0.65rem] font-medium ${item.active ? "text-black" : "text-zinc-500"}`}>
                <Icon className="size-5" strokeWidth={item.active ? 2.3 : 1.8} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {notice && (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-black px-4 py-3 text-sm text-white shadow-2xl md:bottom-6" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="Dismiss message">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
