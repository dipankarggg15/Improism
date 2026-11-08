import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile/profile-settings";

export const metadata: Metadata = {
  title: "Profile & Settings | Improism",
  description: "Manage your Improism profile, subjects, saved posts, and preferences.",
};

export default function ProfilePage() {
  return <ProfileSettings />;
}
