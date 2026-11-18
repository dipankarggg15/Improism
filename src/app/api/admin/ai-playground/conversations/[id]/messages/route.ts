import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import { streamImproismPlaygroundMessage } from "@/lib/ai/improism-controller";
import type { PlaygroundReasoningEffort } from "@/lib/ai/types";

const reasoningEfforts = new Set<PlaygroundReasoningEffort>(["none", "low", "medium", "high"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
  const body = await request.json().catch(() => null) as { message?: unknown; reasoningEffort?: unknown } | null;
  if (!body || typeof body.message !== "string") {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }
  const reasoningEffort = body.reasoningEffort;
  if (typeof reasoningEffort !== "string" || !reasoningEfforts.has(reasoningEffort as PlaygroundReasoningEffort)) {
    return NextResponse.json({ error: "Choose a supported reasoning effort." }, { status: 400 });
  }

  let admin: Awaited<ReturnType<typeof assertAdmin>>;
  try {
    admin = await assertAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "You are not authorized." },
      { status: 403 },
    );
  }

  const encoder = new TextEncoder();
  const encode = (value: unknown) => encoder.encode(`${JSON.stringify(value)}\n`);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const message = await streamImproismPlaygroundMessage({
          supabase: admin.supabase,
          userId: admin.user.id,
          conversationId: id,
          message: body.message as string,
          reasoningEffort: reasoningEffort as PlaygroundReasoningEffort,
          onTextDelta(delta) {
            controller.enqueue(encode({ type: "text_delta", delta }));
          },
        });
        controller.enqueue(encode({ type: "completed", message }));
      } catch (error) {
        console.error("Improism AI playground request failed", error);
        controller.enqueue(encode({
          type: "error",
          error: error instanceof Error ? error.message : "Could not generate an AI response.",
        }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
