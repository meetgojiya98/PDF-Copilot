"use client";

import { useEffect, useState } from "react";
import UploadBox from "@/components/UploadBox";

type Doc = { title: string; count: number };

export default function AdminPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/docs");
    const j = await r.json();
    setDocs(j.docs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(title: string) {
    if (!confirm(`Delete all chunks for "${title}"?`)) return;
    await fetch("/api/docs?title=" + encodeURIComponent(title), { method: "DELETE" });
    load();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-sm text-textDim">Upload, index, and manage your knowledge base.</p>
      </header>

      <UploadBox onUploaded={load} />

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Indexed Documents</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-panel/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-textDim">Title</th>
                <th className="text-left px-6 py-3 font-medium text-textDim">Chunks</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="px-6 py-4 text-textDim" colSpan={3}>Loading…</td></tr>
              )}
              {!loading && docs.length === 0 && (
                <tr><td className="px-6 py-6 text-textDim" colSpan={3}>No documents yet.</td></tr>
              )}
              {docs.map((d) => (
                <tr key={d.title} className="border-b border-border/60">
                  <td className="px-6 py-4">{d.title}</td>
                  <td className="px-6 py-4">{d.count}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="btn-ghost px-3 py-2 rounded-xl" onClick={() => remove(d.title)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
