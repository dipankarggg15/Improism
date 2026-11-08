import type { Metadata } from "next";
import { CreateJourney } from "@/components/journeys/create-journey";

export const metadata: Metadata = {
  title: "Start a Journey | Improism",
  description: "Create a flexible personal improvement journey.",
};

export default function NewJourneyPage() {
  return <CreateJourney />;
}
