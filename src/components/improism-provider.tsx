"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Notifications = {
  daily: boolean;
  journeys: boolean;
  reflections: boolean;
};

export type SavedPostSummary = {
  id: string;
  subject: string;
  title: string;
  readTime: string;
};

type ImproismState = {
  selectedSubjects: string[];
  savedPostIds: string[];
  savedPosts: SavedPostSummary[];
  displayName: string;
  bio: string;
  theme: string;
  timezone: string;
  notifications: Notifications;
  accountEmail?: string;
  accountCreatedAt?: string;
};

const initialState: ImproismState = {
  selectedSubjects: ["Personal Growth", "Philosophy", "Business", "Health", "Relationships"],
  savedPostIds: [],
  savedPosts: [],
  displayName: "Dipankar Ghosh",
  bio: "Learning to live with more attention and intention.",
  theme: "System",
  timezone: "Asia/Kolkata",
  notifications: { daily: true, journeys: true, reflections: false },
};

const storageKey = "improism-prototype-state-v1";
let state = initialState;
let initialized = false;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ImproismState>;
        state = {
          ...initialState,
          ...parsed,
          savedPostIds: Array.isArray(parsed.savedPostIds)
            ? parsed.savedPostIds.filter((id): id is string => typeof id === "string")
            : [],
        };
      }
    } catch {
      state = initialState;
    }
  }
  return state;
}

function updateState(updater: (current: ImproismState) => ImproismState) {
  state = updater(getSnapshot());
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type ImproismContextValue = ImproismState & {
  toggleSubject: (name: string) => Promise<void>;
  toggleSavedPost: (id: string, post?: Omit<SavedPostSummary, "id">) => Promise<void>;
  updateProfile: (displayName: string, bio: string) => Promise<void>;
  setTheme: (theme: string) => void;
  setTimezone: (timezone: string) => Promise<void>;
  toggleNotification: (key: keyof Notifications) => void;
};

const ImproismContext = createContext<ImproismContextValue | null>(null);

export function ImproismProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => initialState);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [profileResult, subjectsResult, savedPostsResult] = await Promise.all([
        supabase.from("profiles").select("display_name, bio, timezone, created_at").single(),
        supabase.from("user_subjects").select("subjects(name)"),
        supabase.from("saved_posts").select("post_id, posts(title, body, excerpt, subjects(name))"),
      ]);

      const selectedSubjects = (subjectsResult.data ?? []).flatMap((row) => {
        const subject = row.subjects as unknown as { name?: string } | null;
        return subject?.name ? [subject.name] : [];
      });
      const savedPosts = (savedPostsResult.data ?? []).flatMap((row) => {
        const post = row.posts as unknown as {
          title?: string;
          body?: string;
          excerpt?: string;
          subjects?: { name?: string } | null;
        } | null;
        if (!post?.title) return [];
        const wordCount = (post.body || post.excerpt || "").trim().split(/\s+/).filter(Boolean).length;
        return [{
          id: row.post_id,
          subject: post.subjects?.name ?? "Improism",
          title: post.title,
          readTime: `${Math.max(1, Math.ceil(wordCount / 220))} min read`,
        }];
      });

      updateState((current) => ({
        ...current,
        displayName: profileResult.data?.display_name ?? current.displayName,
        bio: profileResult.data?.bio ?? current.bio,
        timezone: profileResult.data?.timezone ?? current.timezone,
        selectedSubjects: subjectsResult.error ? current.selectedSubjects : selectedSubjects,
        savedPostIds: savedPostsResult.error
          ? current.savedPostIds
          : (savedPostsResult.data ?? []).map((row) => row.post_id),
        savedPosts: savedPostsResult.error ? current.savedPosts : savedPosts,
        accountEmail: userData.user.email,
        accountCreatedAt: profileResult.data?.created_at ?? userData.user.created_at,
      }));
    })();
  }, []);

  const value: ImproismContextValue = {
    ...snapshot,
    async toggleSubject(name) {
      const wasSelected = getSnapshot().selectedSubjects.includes(name);
      updateState((current) => ({
        ...current,
        selectedSubjects: current.selectedSubjects.includes(name)
          ? current.selectedSubjects.filter((subject) => subject !== name)
          : [...current.selectedSubjects, name],
      }));
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) throw new Error("Your session has expired. Please log in again.");
          const { data: subject, error: subjectError } = await supabase
            .from("subjects")
            .select("id")
            .eq("name", name)
            .single();
          if (subjectError || !subject) throw subjectError ?? new Error("Subject not found.");
          if (wasSelected) {
            const { error } = await supabase
              .from("user_subjects")
              .delete()
              .eq("user_id", userData.user.id)
              .eq("subject_id", subject.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("user_subjects")
              .upsert({ user_id: userData.user.id, subject_id: subject.id });
            if (error) throw error;
          }
        } catch (error) {
          updateState((current) => ({
            ...current,
            selectedSubjects: wasSelected
              ? Array.from(new Set([...current.selectedSubjects, name]))
              : current.selectedSubjects.filter((subject) => subject !== name),
          }));
          throw error;
        }
      }
    },
    async toggleSavedPost(id, post) {
      const wasSaved = getSnapshot().savedPostIds.includes(id);
      const previousSavedPost = getSnapshot().savedPosts.find((savedPost) => savedPost.id === id);
      updateState((current) => ({
        ...current,
        savedPostIds: current.savedPostIds.includes(id)
          ? current.savedPostIds.filter((postId) => postId !== id)
          : [...current.savedPostIds, id],
        savedPosts: wasSaved
          ? current.savedPosts.filter((savedPost) => savedPost.id !== id)
          : post
            ? [...current.savedPosts, { id, ...post }]
            : current.savedPosts,
      }));
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Your session has expired. Please log in again.");
        const query = wasSaved
          ? supabase.from("saved_posts").delete().eq("user_id", userData.user.id).eq("post_id", id)
          : supabase.from("saved_posts").insert({ user_id: userData.user.id, post_id: id });
        const { error } = await query;
        if (error) throw error;
      } catch (error) {
        updateState((current) => ({
          ...current,
          savedPostIds: wasSaved
            ? Array.from(new Set([...current.savedPostIds, id]))
            : current.savedPostIds.filter((postId) => postId !== id),
          savedPosts: wasSaved
            ? previousSavedPost
              ? [...current.savedPosts, previousSavedPost]
              : current.savedPosts
            : current.savedPosts.filter((savedPost) => savedPost.id !== id),
        }));
        throw error;
      }
    },
    async updateProfile(displayName, bio) {
      const previous = getSnapshot();
      updateState((current) => ({ ...current, displayName, bio }));
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        updateState((current) => ({ ...current, displayName: previous.displayName, bio: previous.bio }));
        throw new Error("Your session has expired. Please log in again.");
      }
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio })
        .eq("id", userData.user.id);
      if (error) {
        updateState((current) => ({ ...current, displayName: previous.displayName, bio: previous.bio }));
        throw error;
      }
    },
    setTheme(theme) {
      updateState((current) => ({ ...current, theme }));
    },
    async setTimezone(timezone) {
      const previous = getSnapshot().timezone;
      updateState((current) => ({ ...current, timezone }));
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        updateState((current) => ({ ...current, timezone: previous }));
        throw new Error("Your session has expired. Please log in again.");
      }
      const { error } = await supabase.from("profiles").update({ timezone }).eq("id", userData.user.id);
      if (error) {
        updateState((current) => ({ ...current, timezone: previous }));
        throw error;
      }
    },
    toggleNotification(key) {
      updateState((current) => ({
        ...current,
        notifications: { ...current.notifications, [key]: !current.notifications[key] },
      }));
    },
  };

  return <ImproismContext.Provider value={value}>{children}</ImproismContext.Provider>;
}

export function useImproism() {
  const context = useContext(ImproismContext);
  if (!context) throw new Error("useImproism must be used within ImproismProvider");
  return context;
}
