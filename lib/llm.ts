import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
export const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
export const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3.1:8b";
export async function getChat(){ return new ChatOllama({ baseUrl: OLLAMA_HOST, model: OLLAMA_CHAT_MODEL, temperature: 0.2, streaming: true }); }
export async function embedQuery(text: string): Promise<number[]>{ const emb = new OllamaEmbeddings({ model: OLLAMA_EMBED_MODEL, baseUrl: OLLAMA_HOST }); const vec = await emb.embedQuery(text); return vec; }
