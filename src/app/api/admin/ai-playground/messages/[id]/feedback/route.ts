import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid response." }, { status: 400 });
    const body = await request.json().catch(() => null) as { verdict?: unknown; correction?: unknown } | null;
    const verdict = body?.verdict;
    const correction = typeof body?.correction === "string" ? body.correction.trim() : "";
    if (verdict !== "correct" && verdict !== "incorrect") {
      return NextResponse.json({ error: "Choose Correct or Incorrect." }, { status: 400 });
    }
    if (correction.length > 10000) {
      return NextResponse.json({ error: "Correction must be 10,000 characters or fewer." }, { status: 400 });
    }

    const { supabase, user } = await assertAdmin();
    const { data: message, error: messageError } = await supabase
      .from("ai_test_messages")
      .select("id, role, ai_test_conversations!inner(user_id)")
      .eq("id", id)
      .eq("role", "assistant")
      .eq("ai_test_conversations.user_id", user.id)
      .single();
    if (messageError || !message) return NextResponse.json({ error: "AI response not found." }, { status: 404 });

    const { error } = await supabase.from("ai_test_feedback").upsert({
      message_id: id,
      user_id: user.id,
      verdict,
      correction,
    }, { onConflict: "message_id" });
    if (error) throw error;
    return NextResponse.json({ feedback: { verdict, correction } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save feedback." },
      { status: 403 },
    );
  }
}
