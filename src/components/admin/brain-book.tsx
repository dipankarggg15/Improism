"use client";

import {
  Bold,
  BrainCircuit,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pencil,
  Plus,
  Quote,
  Save,
  Trash2,
  Underline,
  X,
  type LucideIcon,
} from "lucide-react";
import { useActionState, useRef, useState, type MouseEvent } from "react";
import {
  deleteBrainPrinciple,
  saveBrainPrinciple,
  type AdminActionState,
} from "@/app/admin/actions";

export type BrainPrinciple = {
  id: string;
  principleNumber: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type FormatAction = {
  command: string;
  label: string;
  icon: LucideIcon;
  value?: string;
};

const formatActions: FormatAction[] = [
  { command: "formatBlock", value: "h2", label: "Heading", icon: Heading2 },
  { command: "formatBlock", value: "h3", label: "Subheading", icon: Heading3 },
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote },
];

function BrainEditor({
  initial,
  onCancel,
}: {
  initial?: BrainPrinciple;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(saveBrainPrinciple, {});
  const [content, setContent] = useState(initial?.content ?? "");
  const editorRef = useRef<HTMLDivElement>(null);

  function format(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML ?? "");
  }

  return (
    <section id="brain-editor" className="scroll-mt-24 rounded-3xl border border-zinc-300 bg-white p-5 shadow-xl shadow-zinc-200/60 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {initial ? `Editing principle ${initial.principleNumber}` : "New principle"}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
            {initial ? "Refine this principle" : "Add to the Improism philosophy"}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className="grid size-9 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100" aria-label="Close editor">
          <X className="size-4" />
        </button>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={initial?.id ?? ""} />
        <input type="hidden" name="content" value={content} />
        {state.error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)]">
          <label>
            <span className="admin-label">Principle number</span>
            <input
              type="number"
              name="principleNumber"
              defaultValue={initial?.principleNumber}
              min={1}
              max={9999}
              step={1}
              required
              className="admin-input"
              placeholder="1"
            />
          </label>
          <label>
            <span className="admin-label">Title</span>
            <input
              name="title"
              defaultValue={initial?.title}
              minLength={3}
              maxLength={200}
              required
              className="admin-input"
              placeholder="The principle in one clear sentence"
            />
          </label>
        </div>

        <div>
          <span className="admin-label">Full content</span>
          <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2" aria-label="Text formatting toolbar">
            {formatActions.map(({ command, value, label, icon: Icon }) => (
              <button
                key={`${command}-${value ?? label}`}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => format(command, value)}
                className="grid size-9 place-items-center rounded-lg text-zinc-600 hover:bg-white hover:text-black hover:shadow-sm"
              >
                <Icon className="size-4" />
              </button>
            ))}
            <button
              type="button"
              title="Add link"
              aria-label="Add link"
              onClick={() => {
                const url = window.prompt("Link URL");
                if (url) format("createLink", url);
              }}
              className="grid size-9 place-items-center rounded-lg text-zinc-600 hover:bg-white hover:text-black hover:shadow-sm"
            >
              <LinkIcon className="size-4" />
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setContent(event.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: initial?.content ?? "" }}
            className="admin-rich min-h-80 rounded-xl border border-zinc-300 bg-white px-5 py-4 text-base leading-7 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            data-placeholder="Write the principle, its reasoning, examples, and instructions…"
          />
          <p className="mt-2 text-right text-xs text-zinc-400">
            {content.replace(/<[^>]+>/g, " ").trim().length.toLocaleString()} characters
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-zinc-300 px-5 text-sm font-semibold hover:bg-zinc-50">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">
            <Save className="size-4" /> {pending ? "Saving…" : initial ? "Update principle" : "Save principle"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function BrainBook({ principles, notice }: { principles: BrainPrinciple[]; notice?: string }) {
  const [editing, setEditing] = useState<BrainPrinciple | "new" | null>(null);

  function openEditor(principle: BrainPrinciple | "new") {
    setEditing(principle);
    window.requestAnimationFrame(() => {
      document.getElementById("brain-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function visitPrinciple(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    window.history.pushState(null, "", `#principle-${id}`);
    document.getElementById(`principle-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <BrainCircuit className="size-4" /> Admin philosophy library
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Improism Brain</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            The canonical book of Improism principles, philosophies, reasoning methods, and instructions.
          </p>
        </div>
        <button type="button" onClick={() => openEditor("new")} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800">
          <Plus className="size-4" /> New principle
        </button>
      </header>

      {notice && <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {editing && (
        <div className="mb-8">
          <BrainEditor
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Navigation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Table of Contents</h2>
        {principles.length ? (
          <ol className="mt-6 divide-y divide-zinc-100 border-y border-zinc-100">
            {principles.map((principle) => (
              <li key={principle.id}>
                <a
                  href={`#principle-${principle.id}`}
                  onClick={(event) => visitPrinciple(event, principle.id)}
                  className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5 text-sm hover:text-zinc-500"
                >
                  <span className="font-mono text-xs text-zinc-400">{String(principle.principleNumber).padStart(2, "0")}</span>
                  <span className="font-semibold text-zinc-900 group-hover:text-black">{principle.title}</span>
                  <span className="text-xs text-zinc-300">↘</span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center">
            <p className="text-sm font-semibold">The book is ready for its first principle.</p>
            <p className="mt-1 text-sm text-zinc-500">No sample content has been added.</p>
          </div>
        )}
      </section>

      <div className="mt-8 space-y-8">
        {principles.map((principle) => (
          <article
            id={`principle-${principle.id}`}
            key={principle.id}
            className="scroll-mt-24 rounded-3xl border border-zinc-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-11"
          >
            <div className="flex items-start justify-between gap-5 border-b border-zinc-100 pb-6">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Principle {principle.principleNumber}
                </p>
                <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">
                  {principle.title}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => openEditor(principle)} className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-black" title="Edit principle" aria-label={`Edit principle ${principle.principleNumber}`}>
                  <Pencil className="size-4" />
                </button>
                <form
                  action={deleteBrainPrinciple}
                  onSubmit={(event) => {
                    if (!window.confirm(`Delete Principle ${principle.principleNumber}: ${principle.title}? This cannot be undone.`)) event.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={principle.id} />
                  <button type="submit" className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-700" title="Delete principle" aria-label={`Delete principle ${principle.principleNumber}`}>
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
            <div className="admin-rich mt-7 text-[1.02rem] leading-8 text-zinc-700 sm:text-[1.08rem]" dangerouslySetInnerHTML={{ __html: principle.content }} />
            <p className="mt-9 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
              Updated {new Date(principle.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
