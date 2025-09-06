"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function UploadBox({ onUploaded }: { onUploaded?: () => void }) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    const list = Array.from(e.dataTransfer.files || []);
    setFiles(list);
  }

  async function upload() {
    if (!files.length) return;
    setBusy(true);
    try {
      const form = new FormData();
      files.forEach(f => form.append("files", f));
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Upload failed");
      toast.success(`Indexed ${j.addedChunks} chunks`);
      onUploaded?.();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`card p-6 transition ${drag ? "ring-2 ring-primary/50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <div className="text-sm text-textDim mb-2">PDF or TXT — drag & drop or pick files</div>
      <div className="flex items-center gap-3">
        <input type="file" multiple onChange={onPick} className="hidden" id="picker" />
        <label htmlFor="picker" className="btn-ghost rounded-xl px-4 py-2 cursor-pointer">Choose files</label>
        <button onClick={upload} disabled={busy || files.length === 0} className="btn rounded-xl px-4 py-2">
          {busy ? "Uploading…" : "Upload & Index"}
        </button>
      </div>
      {files.length > 0 && (
        <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-textDim">
          {files.map((f) => (
            <li key={f.name} className="truncate border border-border rounded-lg px-3 py-2 bg-panel">{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
