import type { Metadata } from "next";
import { Suspense } from "react";
import { JourneyDetail } from "@/components/journeys/journey-detail";

export const metadata: Metadata = {
  title: "Journey | Improism",
  description: "Plan activities, reflect on progress, and review your journey.",
};

type JourneyPageProps = {
  params: Promise<{ id: string }>;
};

async function JourneyContent({ params }: JourneyPageProps) {
  const { id } = await params;
  return <JourneyDetail journeyId={id} />;
}

export default function JourneyPage({ params }: JourneyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl animate-pulse px-4 py-8 sm:px-6">
          <div className="h-4 w-32 rounded bg-zinc-100" />
          <div className="mt-8 h-28 rounded-3xl bg-zinc-100" />
          <div className="mt-6 h-80 rounded-3xl bg-zinc-100" />
        </div>
      }
    >
      <JourneyContent params={params} />
    </Suspense>
  );
}
