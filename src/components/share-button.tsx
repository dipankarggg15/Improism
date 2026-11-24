"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ path, title, compact = false }: { path: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className={compact
        ? "grid size-9 place-items-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black"
        : "inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold hover:border-black"}
      aria-label={copied ? "Link copied" : `Share ${title}`}
      title={copied ? "Link copied" : "Share"}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
      {!compact && (copied ? "Copied" : "Share")}
    </button>
  );
}
