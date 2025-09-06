// lib/vector.ts
import path from "path";
import fs from "fs";
import type { Document } from "@langchain/core/documents";

import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
// ✅ Memory store comes from core langchain package
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const VECTOR_BACKEND = (process.env.VECTOR_BACKEND || "hnsw").toLowerCase(); // "hnsw" | "memory"
const VECTOR_DIR = process.env.VECTOR_DIR || "./data/vector";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function makeEmbeddings() {
  return new OllamaEmbeddings({ baseUrl: OLLAMA_HOST, model: OLLAMA_EMBED_MODEL });
}
const isHNSW = () => VECTOR_BACKEND === "hnsw";

// ---------- Memory backend (in-process, not persisted) ----------
let memStore: MemoryVectorStore | null = null;
let memDocs: Document[] = [];

// Load existing index or create one from provided docs
export async function loadOrCreateIndex(initialDocs?: Document[]) {
  if (isHNSW()) {
    ensureDir(VECTOR_DIR);
    const e = makeEmbeddings();
    const indexExists = fs.existsSync(path.join(VECTOR_DIR, "hnswlib.index"));
    if (indexExists) return HNSWLib.load(VECTOR_DIR, e);
    if (!initialDocs?.length) throw new Error("Vector index not found and no docs provided to build it.");
    const store = await HNSWLib.fromDocuments(initialDocs, e);
    await store.save(VECTOR_DIR);
    return store;
  } else {
    if (!memStore) {
      memStore = new MemoryVectorStore(makeEmbeddings());
      if (initialDocs?.length) {
        await memStore.addDocuments(initialDocs);
        memDocs.push(...initialDocs);
      }
    }
    return memStore;
  }
}

// Append chunks (creates index on first upload)
export async function addChunksToVector(docs: Document[]) {
  if (isHNSW()) {
    ensureDir(VECTOR_DIR);
    const e = makeEmbeddings();
    const indexExists = fs.existsSync(path.join(VECTOR_DIR, "hnswlib.index"));
    if (indexExists) {
      const store = await HNSWLib.load(VECTOR_DIR, e);
      await store.addDocuments(docs);
      await store.save(VECTOR_DIR);
    } else {
      const store = await HNSWLib.fromDocuments(docs, e);
      await store.save(VECTOR_DIR);
    }
    return { addedChunks: docs.length };
  } else {
    if (!memStore) memStore = new MemoryVectorStore(makeEmbeddings());
    await memStore.addDocuments(docs);
    memDocs.push(...docs);
    return { addedChunks: docs.length };
  }
}

// ❇️ Simple wrapper used by lib/retrieval.ts
export async function similaritySearch(query: string, k = 8): Promise<Document[]> {
  const store: any = await loadOrCreateIndex();
  return store.similaritySearch(query, k);
}

// Used by /api/docs to show per-document chunk counts
export async function docStats() {
  if (isHNSW()) {
    const docstorePath = path.join(VECTOR_DIR, "docstore.json");
    if (!fs.existsSync(docstorePath)) return { docs: [] as { title: string; count: number }[] };
    try {
      const raw = JSON.parse(fs.readFileSync(docstorePath, "utf8"));
      const counts: Record<string, number> = {};
      for (const id of Object.keys(raw.docs || {})) {
        const meta = raw.docs[id]?.metadata || {};
        const title = meta.title || meta.source || "Untitled";
        counts[title] = (counts[title] || 0) + 1;
      }
      const docs = Object.entries(counts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => a.title.localeCompare(b.title));
      return { docs };
    } catch {
      return { docs: [] as { title: string; count: number }[] };
    }
  } else {
    const counts: Record<string, number> = {};
    for (const d of memDocs) {
      const title = (d.metadata?.title as string) || (d.metadata?.source as string) || "Untitled";
      counts[title] = (counts[title] || 0) + 1;
    }
    const docs = Object.entries(counts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return { docs };
  }
}
