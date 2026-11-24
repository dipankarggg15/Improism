import type { Metadata } from "next";
import { AiChat } from "@/components/ai-chat";

export const metadata: Metadata = {
  title: "Improism AI | Under development",
  description: "Improism AI is under development.",
};

export default function AiPage() {
  return <AiChat developmentOnly />;
}
