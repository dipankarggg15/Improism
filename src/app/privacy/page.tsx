import type { Metadata } from "next";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = { title: "Privacy | Improism" };

export default function PrivacyPage() {
  return <InfoPageShell eyebrow="Privacy" title="Your personal progress should remain personal.">
    <p>Improism stores the account information required to provide authentication, subject preferences, saved content, daily feed state, and Journeys.</p>
    <h2>How your data is protected</h2>
    <p>Supabase authentication protects your session. Database Row Level Security restricts personal records to their owner, while administrative content access is restricted to authorized administrators.</p>
    <h2>Personalization</h2>
    <p>Your selected subjects and feed state determine which published content appears. You can disable personalization in Profile, change subjects at any time, or download a copy of your stored account data.</p>
    <h2>Deletion</h2>
    <p>You can permanently delete your account from Profile. Account deletion removes the profile and associated personal records through database relationships. This action cannot be undone.</p>
    <h2>AI</h2>
    <p>Public AI features are under development and are not part of the current member experience.</p>
  </InfoPageShell>;
}
