import type { Metadata } from "next";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = { title: "About | Improism" };

export default function AboutPage() {
  return <InfoPageShell eyebrow="About Improism" title="A place for thoughtful improvement.">
    <p>Improism helps people encounter useful ideas, build meaningful personal practices, and reflect on progress without turning life into a performance.</p>
    <h2>What the product includes</h2>
    <p>Short Posts offer daily perspectives from subjects you choose. Articles explore ideas in more depth. Journeys turn intentions into activities and reflections that remain private to your account.</p>
    <h2>What guides the product</h2>
    <p>Improism values clarity, personal responsibility, intellectual humility, and progress that can survive ordinary days. The product is being developed carefully, with unfinished features marked honestly.</p>
  </InfoPageShell>;
}
