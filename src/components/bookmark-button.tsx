"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useImproism } from "@/components/improism-provider";

export function BookmarkButton({ id, title, subject, readTime, compact = false }: { id: string; title: string; subject: string; readTime: string; compact?: boolean }) {
  const { savedPostIds, toggleSavedPost } = useImproism();
  const [error, setError] = useState("");
  const saved = savedPostIds.includes(id);

  async function toggle() {
    try {
      await toggleSavedPost(id, { title, subject, readTime });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update saved content.");
    }
  }

  return <span className="relative inline-flex">
    <button
      type="button"
      onClick={() => void toggle()}
      className={compact
        ? `grid size-9 place-items-center rounded-full transition-colors ${saved ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-black"}`
        : `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${saved ? "border-black bg-black text-white" : "border-zinc-300 hover:border-black"}`}
      aria-label={saved ? "Remove from saved content" : "Save for later"}
      title={saved ? "Saved" : "Save"}
    >
      <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {!compact && (saved ? "Saved" : "Save")}
    </button>
    {error && <span className="absolute right-0 top-full z-10 mt-2 w-52 rounded-lg bg-red-50 p-2 text-xs text-red-700 shadow">{error}</span>}
  </span>;
}
