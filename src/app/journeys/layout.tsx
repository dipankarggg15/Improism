import type { ReactNode } from "react";
import { JourneysShell } from "@/components/journeys/journeys-shell";

export default function JourneysLayout({ children }: { children: ReactNode }) {
  return <JourneysShell>{children}</JourneysShell>;
}
