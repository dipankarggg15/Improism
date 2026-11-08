"use client";

import { useActionState, useRef, useState } from "react";
import { Bold, Eye, ImageIcon, Italic, Link as LinkIcon, List, Quote, Underline } from "lucide-react";
import type { AdminActionState } from "@/app/admin/actions";

type Subject = { id: string; name: string };
type Initial = {
  id?: string;
  articleId?: string;
  title?: string;
  subjectId?: string;
  body?: string;
  imageUrl?: string | null;
  status?: string;
};

export function ContentEditor({
  kind,
  subjects,
  initial = {},
  action,
}: {
  kind: "post" | "article";
  subjects: Subject[];
  initial?: Initial;
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [title, setTitle] = useState(initial.title ?? "");
  const [body, setBody] = useState(initial.body ?? "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const article = kind === "article";

  function format(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setBody(editorRef.current?.innerHTML ?? "");
  }

  function selectImage(file?: File) {
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <input type="hidden" name={article ? "postId" : "id"} value={initial.id ?? ""} />
      {article && <input type="hidden" name="articleId" value={initial.articleId ?? ""} />}
      {article && <input type="hidden" name="body" value={body} />}
      <div className="space-y-5">
        {state.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="admin-label">Title</span>
              <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={200} required className="admin-input text-lg font-medium" placeholder={article ? "A clear, compelling article title" : "A concise post title"} />
            </label>
            <label>
              <span className="admin-label">Subject</span>
              <select name="subjectId" defaultValue={initial.subjectId ?? ""} required className="admin-input">
                <option value="" disabled>Choose a subject</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label>
              <span className="admin-label">Cover image <span className="font-normal text-zinc-400">(optional)</span></span>
              <span className="flex h-11 items-center gap-2 rounded-xl border border-zinc-300 px-3 text-sm text-zinc-600 hover:border-zinc-500">
                <ImageIcon className="size-4" /> Choose image
                <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} />
              </span>
            </label>
          </div>
          {imageUrl && (
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
              {/* Dynamic Supabase URLs cannot be known in next.config ahead of deployment. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Current content cover" className="h-48 w-full object-cover" />
              <label className="flex items-center gap-2 border-t border-zinc-200 px-4 py-3 text-xs text-zinc-600">
                <input type="checkbox" name="removeImage" checked={removeImage} onChange={(event) => { setRemoveImage(event.target.checked); if (event.target.checked) setImageUrl(""); }} /> Remove this image
              </label>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <span className="admin-label">{article ? "Formatted body" : "Body"}</span>
          {article ? (
            <>
              <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2" aria-label="Text formatting toolbar">
                {[
                  ["bold", Bold, "Bold"], ["italic", Italic, "Italic"], ["underline", Underline, "Underline"],
                  ["insertUnorderedList", List, "Bullet list"], ["formatBlock", Quote, "Quote"],
                ].map(([command, Icon, label]) => (
                  <button key={String(command)} type="button" title={String(label)} onClick={() => format(String(command), command === "formatBlock" ? "blockquote" : undefined)} className="grid size-9 place-items-center rounded-lg hover:bg-white hover:shadow-sm">
                    <Icon className="size-4" />
                  </button>
                ))}
                <button type="button" title="Add link" onClick={() => { const url = window.prompt("Link URL"); if (url) format("createLink", url); }} className="grid size-9 place-items-center rounded-lg hover:bg-white hover:shadow-sm"><LinkIcon className="size-4" /></button>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(event) => setBody(event.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: initial.body ?? "" }} className="admin-rich min-h-80 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-black/10" data-placeholder="Write the article…" />
            </>
          ) : (
            <textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} required maxLength={10000} rows={14} className="admin-input resize-y leading-7" placeholder="Write the post…" />
          )}
          <p className="mt-2 text-right text-xs text-zinc-400">{article ? body.replace(/<[^>]+>/g, " ").trim().length : body.length} characters</p>
        </section>

        <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button type="submit" name="status" value="draft" disabled={pending} className="h-11 rounded-xl border border-zinc-300 px-5 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50">{pending ? "Saving…" : "Save draft"}</button>
          <button type="submit" name="status" value="published" disabled={pending} className="h-11 rounded-xl bg-black px-5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">{initial.status === "published" ? "Update published" : "Publish"}</button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-8 xl:self-start">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500"><Eye className="size-4" /> Live mobile preview</div>
        <div className="mx-auto w-full max-w-[390px] rounded-[2.3rem] border-[7px] border-zinc-900 bg-zinc-100 p-2 shadow-2xl">
          <div className="mx-auto mb-2 h-5 w-24 rounded-full bg-zinc-900" />
          <div className="max-h-[720px] min-h-[590px] overflow-y-auto rounded-[1.65rem] bg-white">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview cover" className="aspect-[16/10] w-full object-cover" />
            ) : <div className="grid aspect-[16/10] place-items-center bg-zinc-950 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Improism</div>}
            <div className="p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">{article ? "Article" : "Improism note"}</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.04em]">{title || "Your title will appear here"}</h2>
              {article ? <div className="admin-rich mt-4 text-sm leading-6 text-zinc-600" dangerouslySetInnerHTML={{ __html: body || "<p>Your formatted article will appear here.</p>" }} /> : <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{body || "Your post body will appear here as you write."}</p>}
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
