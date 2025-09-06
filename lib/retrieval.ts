import { similaritySearch } from "./vector";
import { allChunks, Chunk } from "./store";
import { bm25Scores, rrfFuse } from "./lex";
import { getChat } from "./llm";
const USE_LLM_RERANK = (process.env.RERANK_LLM || "false").toLowerCase()==="true";
export async function retrieve(question: string, k=8){
  const all = allChunks();
  const vec = await similaritySearch(question, Math.min(32, Math.max(24, k*3)));
  const vecScored = vec.map(([doc, score], idx)=>({ id: idx, content: doc.pageContent, title: String(doc.metadata?.title||"Document"), score: 1-score }));
  const docs = all.map((c, id)=>({ id, text: c.content }));
  const lexScores = bm25Scores(question, docs).slice(0, Math.min(32, docs.length));
  const lexToChunk = (id:number)=> all[id];
  const lexAsVec = lexScores.map((s)=>({ id: s.id, score: s.score }));
  const fused = rrfFuse(vecScored.map((v,i)=>({ id:i, score:v.score })), lexAsVec);
  const pool: Chunk[] = []; const seen = new Set<string>();
  for(const v of vecScored){ const key=v.content.slice(0,120); if(!seen.has(key)){ pool.push({ title:v.title, content:v.content, embedding:[] }); seen.add(key);} }
  for(const s of lexScores){ const c = lexToChunk(s.id); const key=c.content.slice(0,120); if(!seen.has(key)){ pool.push(c); seen.add(key);} }
  let top = pool.slice(0,k);
  if(USE_LLM_RERANK){
    const chat = await getChat(); const batch = pool.slice(0, Math.min(24, pool.length));
    const prompt = ["You are a strict ranker.",`Question: ${question}`,"Score each candidate 0-10 for answer relevance. Output only lines like: i=<n> score=<0-10>",...batch.map((p,idx)=>`[${idx}] ${p.content.slice(0,1000)}`)].join("\n\n");
    const stream = await chat.stream([ { role:"user", content: prompt } ] as any); let text = ""; for await (const chunk of stream) { text += chunk?.content || ""; }
    const matches = Array.from(text.matchAll(/i\s*=\s*(\d+)\s+score\s*=\s*([0-9.]+)/g));
    const scored = matches.map(m=>({ idx: Number(m[1]), score: Number(m[2]) })).filter(x=>Number.isFinite(x.score) && x.idx < batch.length).sort((a,b)=>b.score-a.score);
    top = scored.slice(0,k).map(s=> batch[s.idx]);
  }
  return top;
}
