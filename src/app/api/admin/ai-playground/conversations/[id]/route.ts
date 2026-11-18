import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import type { GoverningDocumentSnapshot, PlaygroundFeedback } from "@/lib/ai/types";

function validId(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!validId(id)) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    const { supabase, user } = await assertAdmin();
    const { data: conversation, error: conversationError } = await supabase
      .from("ai_test_conversations")
      .select("id, title, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (conversationError || !conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    const { data: messages, error: messageError } = await supabase
      .from("ai_test_messages")
      .select("id, conversation_id, role, content, model, input_tokens, output_tokens, total_tokens, governing_documents, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (messageError) throw messageError;
    const messageIds = (messages ?? []).map((message) => message.id);
    const { data: feedbackRows, error: feedbackError } = messageIds.length
      ? await supabase
          .from("ai_test_feedback")
          .select("message_id, verdict, correction")
          .in("message_id", messageIds)
      : { data: [], error: null };
    if (feedbackError) throw feedbackError;
    const feedbackByMessage = new Map((feedbackRows ?? []).map((feedback) => [
      feedback.message_id,
      { verdict: feedback.verdict, correction: feedback.correction } as PlaygroundFeedback,
    ]));

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      },
      messages: (messages ?? []).map((message) => ({
        id: message.id,
        conversationId: message.conversation_id,
        role: message.role,
        content: message.content,
        model: message.model,
        inputTokens: message.input_tokens,
        outputTokens: message.output_tokens,
        totalTokens: message.total_tokens,
        governingDocuments: message.governing_documents as GoverningDocumentSnapshot[],
        feedback: feedbackByMessage.get(message.id) ?? null,
        createdAt: message.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load the conversation." },
      { status: 403 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!validId(id)) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    const { supabase, user } = await assertAdmin();
    const { error } = await supabase
      .from("ai_test_conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete the conversation." },
      { status: 403 },
    );
  }
}
