import type { Metadata } from "next";
import { ImproismProvider } from "@/components/improism-provider";
import { JourneysProvider } from "@/components/journeys/journeys-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Improism",
  description:
    "Ideas, conversations, and personal journeys for a more intentional life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <ImproismProvider>
          <JourneysProvider>{children}</JourneysProvider>
        </ImproismProvider>
      </body>
    </html>
  );
}
