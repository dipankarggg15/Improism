import type { Metadata } from "next";
import { AiChat } from "@/components/ai-chat";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Improism AI",
  description: "Think through ideas and explore posts with Improism AI.",
};

type AiPageProps = {
  searchParams: Promise<{
    post?: string | string[];
    conversation?: string | string[];
    journey?: string | string[];
  }>;
};

async function AiPageContent({ searchParams }: AiPageProps) {
  const query = await searchParams;
  const postId = typeof query.post === "string" ? query.post : undefined;
  const conversationId = typeof query.conversation === "string" ? query.conversation : undefined;
  const journeyId = typeof query.journey === "string" ? query.journey : undefined;
  const contextKey = postId ? `post-${postId}` : conversationId ? `conversation-${conversationId}` : journeyId ? `journey-${journeyId}` : "new";

  return (
    <AiChat
      key={contextKey}
      initialPostId={postId}
      initialConversationId={conversationId}
      initialJourneyId={journeyId}
    />
  );
}

export default function AiPage({ searchParams }: AiPageProps) {
  return (
    <Suspense fallback={<AiChat />}>
      <AiPageContent searchParams={searchParams} />
    </Suspense>
  );
}
