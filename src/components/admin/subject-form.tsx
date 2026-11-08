"use client";

import { useActionState, useState } from "react";
import { ImageIcon } from "lucide-react";
import { saveSubject, type AdminActionState } from "@/app/admin/actions";

export function SubjectForm({ initial }: { initial?: { id: string; name: string; description: string; is_active: boolean; image_url?: string | null } }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveSubject, {});
  const [image, setImage] = useState(initial?.image_url ?? "");
  return (
    <form action={action} className="max-w-3xl space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      {state.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <label><span className="admin-label">Name</span><input name="name" defaultValue={initial?.name} minLength={2} maxLength={80} required className="admin-input" /></label>
      <label><span className="admin-label">Description</span><textarea name="description" defaultValue={initial?.description} maxLength={300} rows={4} className="admin-input resize-y" /></label>
      <label>
        <span className="admin-label">Subject image <span className="font-normal text-zinc-400">(optional)</span></span>
        <span className="flex h-11 items-center gap-2 rounded-xl border border-zinc-300 px-3 text-sm text-zinc-600"><ImageIcon className="size-4" /> Choose image<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setImage(URL.createObjectURL(file)); }} /></span>
      </label>
      {image && <div className="overflow-hidden rounded-xl border border-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Subject" className="h-48 w-full object-cover" />
        <label className="flex items-center gap-2 border-t p-3 text-xs text-zinc-600"><input type="checkbox" name="removeImage" onChange={(event) => event.target.checked && setImage("")} /> Remove image</label>
      </div>}
      <label className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 text-sm font-medium"><input type="checkbox" name="isActive" defaultChecked={initial?.is_active ?? true} className="size-4" /> Active and available to users</label>
      <div className="flex justify-end"><button disabled={pending} className="h-11 rounded-xl bg-black px-5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Save subject"}</button></div>
    </form>
  );
}
