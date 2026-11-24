import type { Metadata } from "next";
import { submitFeedback } from "@/app/feedback/actions";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = { title: "Feedback | Improism" };
export const instant = false;

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <InfoPageShell eyebrow="Feedback" title="Help us improve Improism.">
    {query.sent === "1" && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Thank you. Your feedback has been saved.</p>}
    <p>Share what felt useful, confusing, incomplete, or unexpectedly difficult. Feedback is linked to your account so it can be investigated responsibly.</p>
    <form action={submitFeedback} className="mt-6 space-y-4">
      <input type="hidden" name="pagePath" value="/feedback" />
      <label className="block text-sm font-semibold text-zinc-800">Your feedback
        <textarea name="message" required minLength={3} maxLength={5000} rows={8} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-black" placeholder="Tell us what should work better…" />
      </label>
      <button type="submit" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800">Send feedback</button>
    </form>
  </InfoPageShell>;
}
