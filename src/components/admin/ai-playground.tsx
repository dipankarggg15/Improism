"use client";

import {
  Bot,
  Check,
  ChevronDown,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PlaygroundConversation,
  PlaygroundFeedback,
  PlaygroundMessage,
  PlaygroundReasoningEffort,
} from "@/lib/ai/types";

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error || "The request failed.");
  return body;
}

type StreamEvent =
  | { type: "text_delta"; delta: string }
  | { type: "completed"; message: PlaygroundMessage }
  | { type: "error"; error: string };

async function streamMessage(
  url: string,
  body: { message: string; reasoningEffort: PlaygroundReasoningEffort },
  onEvent: (event: StreamEvent) => void,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || "The request failed.");
  }
  if (!response.body) throw new Error("The response stream was unavailable.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as StreamEvent;
      if (event.type === "error") throw new Error(event.error);
      if (event.type === "completed") completed = true;
      onEvent(event);
    }
    if (done) break;
  }
  if (buffer.trim()) {
    const event = JSON.parse(buffer) as StreamEvent;
    if (event.type === "error") throw new Error(event.error);
    if (event.type === "completed") completed = true;
    onEvent(event);
  }
  if (!completed) throw new Error("The response stream ended before the answer was saved.");
}

function AssistantMessage({
  message,
  onFeedback,
}: {
  message: PlaygroundMessage;
  onFeedback: (messageId: string, verdict: "correct" | "incorrect", correction: string) => Promise<void>;
}) {
  const streaming = message.id.startsWith("streaming-");
  const [verdict, setVerdict] = useState<"correct" | "incorrect" | null>(message.feedback?.verdict ?? null);
  const [correction, setCorrection] = useState(message.feedback?.correction ?? "");
  const [saving, setSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  async function save(nextVerdict = verdict) {
    if (!nextVerdict) return;
    setSaving(true);
    setFeedbackError("");
    try {
      await onFeedback(message.id, nextVerdict, correction);
      setVerdict(nextVerdict);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Could not save feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex justify-start">
      <article className="w-full max-w-3xl rounded-2xl rounded-bl-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <span className="grid size-7 place-items-center rounded-full bg-black text-white"><Bot className="size-3.5" /></span>
          Improism AI
        </div>
        <div className="mt-4 whitespace-pre-wrap text-[0.95rem] leading-7 text-zinc-800">{message.content}</div>

        {streaming ? (
          <span className="mt-3 inline-block h-4 w-1 animate-pulse rounded-full bg-zinc-400" aria-label="Response streaming" />
        ) : <div className="mt-5 border-t border-zinc-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("correct")}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${verdict === "correct" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-zinc-200 hover:bg-zinc-50"}`}
            >
              <Check className="size-3.5" /> Correct
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("incorrect")}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${verdict === "incorrect" ? "border-red-300 bg-red-50 text-red-700" : "border-zinc-200 hover:bg-zinc-50"}`}
            >
              <X className="size-3.5" /> Incorrect
            </button>
            <span className="ml-auto text-[0.68rem] text-zinc-400">
              {message.model ?? "Unknown model"} · {message.totalTokens?.toLocaleString() ?? "—"} tokens
            </span>
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-zinc-500">Optional correction</span>
            <textarea
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
              maxLength={10000}
              rows={2}
              placeholder="Explain what the answer should have said…"
              className="admin-input mt-1.5 resize-y"
            />
          </label>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-600">{feedbackError}</p>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!verdict || saving}
              className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save feedback"}
            </button>
          </div>

          <details className="group mt-4 rounded-xl bg-zinc-50">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-600">
              {message.governingDocuments.length} governing documents supplied
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="max-h-56 overflow-y-auto border-t border-zinc-200 px-3 py-2">
              {message.governingDocuments.map((document) => (
                <div key={`${document.kind}-${document.id}`} className="border-b border-zinc-100 py-2 text-xs last:border-0">
                  <p className="font-semibold text-zinc-700">
                    {document.kind === "ai_rule" ? "AI Rule" : "Brain Principle"} {String(document.number).padStart(3, "0")} — {document.title}
                  </p>
                  <p className="mt-0.5 text-zinc-400">Version {document.version} · Updated {new Date(document.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
                </div>
              ))}
            </div>
          </details>
          <div className="mt-3 grid gap-1 text-[0.67rem] text-zinc-400 sm:grid-cols-2">
            <p>Input {message.inputTokens?.toLocaleString() ?? "—"} · Cached {message.cachedInputTokens?.toLocaleString() ?? "—"} · Cache writes {message.cacheWriteTokens?.toLocaleString() ?? "—"}</p>
            <p>Output {message.outputTokens?.toLocaleString() ?? "—"} · Reasoning {message.reasoningTokens?.toLocaleString() ?? "—"} · Effort {message.reasoningEffort ?? "—"}</p>
            <p>Total {message.totalDurationMs?.toLocaleString() ?? "—"} ms · Brain {message.brainLoadMs?.toLocaleString() ?? "—"} ms</p>
            <p>First text {message.firstTokenMs?.toLocaleString() ?? "—"} ms · OpenAI complete {message.completionMs?.toLocaleString() ?? "—"} ms</p>
          </div>
        </div>}
      </article>
    </div>
  );
}

export function AIPlayground({
  initialConversations,
  configuredModel,
  configuredReasoningEffort,
  apiKeyConfigured,
}: {
  initialConversations: PlaygroundConversation[];
  configuredModel: string;
  configuredReasoningEffort: PlaygroundReasoningEffort;
  apiKeyConfigured: boolean;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(Boolean(initialConversations[0]));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reasoningEffort, setReasoningEffort] = useState(configuredReasoningEffort);
  const skipNextLoad = useRef<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, conversations],
  );

  useEffect(() => {
    if (!activeId) return;
    if (skipNextLoad.current === activeId) {
      skipNextLoad.current = null;
      return;
    }
    let active = true;
    void api<{ messages: PlaygroundMessage[] }>(`/api/admin/ai-playground/conversations/${activeId}`)
      .then((data) => {
        if (active) setMessages(data.messages);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the conversation.");
      })
      .finally(() => {
        if (active) setLoadingConversation(false);
      });
    return () => { active = false; };
  }, [activeId]);

  async function newConversation() {
    setError("");
    const result = await api<{ conversation: PlaygroundConversation }>("/api/admin/ai-playground/conversations", { method: "POST" });
    setConversations((current) => [result.conversation, ...current]);
    skipNextLoad.current = result.conversation.id;
    setActiveId(result.conversation.id);
    setMessages([]);
    setLoadingConversation(false);
  }

  async function selectConversation(id: string) {
    if (id === activeId) return;
    setError("");
    setLoadingConversation(true);
    setMessages([]);
    setActiveId(id);
  }

  async function deleteConversation(id: string) {
    if (!window.confirm("Delete this test conversation and all of its messages and feedback?")) return;
    setError("");
    await api(`/api/admin/ai-playground/conversations/${id}`, { method: "DELETE" });
    const remaining = conversations.filter((conversation) => conversation.id !== id);
    setConversations(remaining);
    if (activeId === id) {
      setMessages([]);
      setActiveId(remaining[0]?.id ?? null);
      setLoadingConversation(Boolean(remaining[0]));
    }
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || sending || !apiKeyConfigured) return;
    setSending(true);
    setError("");
    setInput("");
    let conversationId = activeId;
    const requestId = Date.now().toString();
    const pendingUserId = `pending-${requestId}`;
    const streamingAssistantId = `streaming-${requestId}`;
    try {
      if (!conversationId) {
        const created = await api<{ conversation: PlaygroundConversation }>("/api/admin/ai-playground/conversations", { method: "POST" });
        conversationId = created.conversation.id;
        setConversations((current) => [created.conversation, ...current]);
        skipNextLoad.current = conversationId;
        setActiveId(conversationId);
      }
      const optimistic: PlaygroundMessage = {
        id: pendingUserId,
        conversationId,
        role: "user",
        content,
        model: null,
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        cachedInputTokens: null,
        cacheWriteTokens: null,
        reasoningTokens: null,
        reasoningEffort,
        totalDurationMs: null,
        brainLoadMs: null,
        firstTokenMs: null,
        completionMs: null,
        governingDocuments: [],
        feedback: null,
        createdAt: new Date().toISOString(),
      };
      const streamingAssistant: PlaygroundMessage = {
        ...optimistic,
        id: streamingAssistantId,
        role: "assistant",
        content: "",
      };
      setMessages((current) => [...current, optimistic, streamingAssistant]);
      await streamMessage(`/api/admin/ai-playground/conversations/${conversationId}/messages`, {
        message: content,
        reasoningEffort,
      }, (event) => {
        if (event.type === "text_delta") {
          setMessages((current) => current.map((item) => item.id === streamingAssistantId
            ? { ...item, content: item.content + event.delta }
            : item));
        } else if (event.type === "completed") {
          setMessages((current) => current.map((item) => item.id === streamingAssistantId ? event.message : item));
          setConversations((current) => current.map((conversation) => conversation.id === conversationId
            ? {
                ...conversation,
                title: conversation.title === "New conversation" ? content.slice(0, 72) : conversation.title,
                updatedAt: new Date().toISOString(),
              }
            : conversation));
        }
      });
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== pendingUserId && message.id !== streamingAssistantId));
      setInput(content);
      setError(requestError instanceof Error ? requestError.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  async function saveFeedback(messageId: string, verdict: "correct" | "incorrect", correction: string) {
    const result = await api<{ feedback: PlaygroundFeedback }>(`/api/admin/ai-playground/messages/${messageId}/feedback`, {
      method: "PUT",
      body: JSON.stringify({ verdict, correction }),
    });
    setMessages((current) => current.map((message) =>
      message.id === messageId ? { ...message, feedback: result.feedback } : message,
    ));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="flex max-h-72 flex-col border-b border-zinc-200 bg-zinc-50 lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="border-b border-zinc-200 p-4">
          <button type="button" onClick={() => void newConversation()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white hover:bg-zinc-800">
            <MessageSquarePlus className="size-4" /> New conversation
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {conversations.map((conversation) => (
            <div key={conversation.id} className={`group mb-1 flex items-center rounded-xl ${activeId === conversation.id ? "bg-white shadow-sm" : "hover:bg-white/70"}`}>
              <button type="button" onClick={() => void selectConversation(conversation.id)} className="min-w-0 flex-1 px-3 py-3 text-left">
                <span className="block truncate text-sm font-semibold">{conversation.title}</span>
                <span className="mt-1 block text-[0.65rem] text-zinc-400">{new Date(conversation.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}</span>
              </button>
              <button type="button" onClick={() => void deleteConversation(conversation.id)} className="mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-zinc-300 opacity-0 hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 focus:opacity-100" aria-label={`Delete ${conversation.title}`}>
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {!conversations.length && <p className="px-3 py-8 text-center text-xs leading-5 text-zinc-400">No test conversations yet.</p>}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col bg-zinc-50/40">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{activeConversation?.title ?? "New AI test"}</h1>
            <p className="mt-0.5 text-xs text-zinc-400">Model: {configuredModel}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">
              Reasoning
              <select
                value={reasoningEffort}
                onChange={(event) => setReasoningEffort(event.target.value as PlaygroundReasoningEffort)}
                disabled={sending}
                className="ml-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-700"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-[0.65rem] font-semibold text-amber-700 ring-1 ring-amber-200 sm:inline">Private admin test</span>
          </div>
        </header>

        {!apiKeyConfigured && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            OPENAI_API_KEY is not configured. Add it to the server environment before testing.
          </div>
        )}
        {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7">
          {loadingConversation ? (
            <div className="grid min-h-80 place-items-center text-zinc-400"><LoaderCircle className="size-6 animate-spin" /></div>
          ) : messages.length ? (
            <div className="mx-auto space-y-5">
              {messages.map((message) => message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-2xl whitespace-pre-wrap rounded-2xl rounded-br-md bg-black px-4 py-3 text-sm leading-6 text-white sm:px-5">{message.content}</div>
                </div>
              ) : (
                <AssistantMessage key={message.id} message={message} onFeedback={saveFeedback} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex min-h-96 max-w-xl flex-col items-center justify-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-black text-white"><Bot className="size-6" /></span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Test the Improism mind</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Every response loads the latest ordered AI Rules and Brain principles directly from Supabase.</p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 bg-white p-3 sm:p-5">
          <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-zinc-300 p-2 pl-4 focus-within:border-black">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              maxLength={8000}
              rows={2}
              disabled={sending || !apiKeyConfigured}
              placeholder="Ask Improism AI a test question…"
              className="max-h-40 min-h-12 flex-1 resize-none bg-transparent py-2 text-sm leading-6 outline-none disabled:opacity-50"
            />
            <button type="button" onClick={() => void sendMessage()} disabled={!input.trim() || sending || !apiKeyConfigured} className="grid size-11 shrink-0 place-items-center rounded-xl bg-black text-white disabled:opacity-30" aria-label="Send message">
              {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-4xl text-center text-[0.67rem] text-zinc-400">Enter to send · Shift+Enter for a new line · Maximum 8,000 characters</p>
        </div>
      </section>
    </div>
  );
}
