import type { Metadata } from "next";
import { JourneysOverview } from "@/components/journeys/journeys-overview";

export const metadata: Metadata = {
  title: "Journeys | Improism",
  description: "Plan, practice, and reflect on the changes that matter to you.",
};

export default function JourneysPage() {
  return <JourneysOverview />;
}
