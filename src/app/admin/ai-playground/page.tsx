import type { Metadata } from "next";
import { AIPlayground } from "@/components/admin/ai-playground";
import { requireAdmin } from "@/lib/admin/auth";
import { configuredModel, configuredReasoningEffort } from "@/lib/ai/improism-controller";
import type { PlaygroundConversation } from "@/lib/ai/types";

export const metadata: Metadata = {
  title: "AI Playground | Admin CMS",
};

export const instant = false;

export default async function AIPlaygroundPage() {
  const { supabase, user } = await requireAdmin();
  const { data, error } = await supabase
    .from("ai_test_conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load AI playground: ${error.message}`);

  const conversations: PlaygroundConversation[] = (data ?? []).map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
  }));

  return (
    <AIPlayground
      initialConversations={conversations}
      configuredModel={configuredModel()}
      configuredReasoningEffort={configuredReasoningEffort()}
      apiKeyConfigured={Boolean(process.env.OPENAI_API_KEY?.trim())}
    />
  );
}
