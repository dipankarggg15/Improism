import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const { supabase, user } = await assertAdmin();
    const { data, error } = await supabase
      .from("ai_test_conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({
      conversations: (data ?? []).map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load conversations." },
      { status: 403 },
    );
  }
}

export async function POST() {
  try {
    const { supabase, user } = await assertAdmin();
    const { count, error: countError } = await supabase
      .from("ai_test_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countError) throw countError;
    if ((count ?? 0) >= 200) {
      return NextResponse.json({ error: "Delete an older test conversation before creating another." }, { status: 409 });
    }
    const { data, error } = await supabase
      .from("ai_test_conversations")
      .insert({ user_id: user.id, title: "New conversation" })
      .select("id, title, created_at, updated_at")
      .single();
    if (error || !data) throw error ?? new Error("Could not create conversation.");
    return NextResponse.json({
      conversation: {
        id: data.id,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create conversation." },
      { status: 403 },
    );
  }
}
