import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import { sendImproismPlaygroundMessage } from "@/lib/ai/improism-controller";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    const body = await request.json().catch(() => null) as { message?: unknown } | null;
    if (!body || typeof body.message !== "string") {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }
    const { supabase, user } = await assertAdmin();
    const message = await sendImproismPlaygroundMessage({
      supabase,
      userId: user.id,
      conversationId: id,
      message: body.message,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate an AI response.";
    const status = message.includes("Rate limit") || message.includes("Daily playground")
      ? 429
      : message.includes("not configured")
        ? 503
        : message.includes("Conversation not found")
          ? 404
          : message.startsWith("Message must")
            ? 400
            : 502;
    console.error("Improism AI playground request failed", error);
    return NextResponse.json({ error: message }, { status });
  }
}
