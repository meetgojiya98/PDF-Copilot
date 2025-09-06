const STOP = new Set(["the","a","an","of","for","and","to","in","on","with","by","is","are","be","as","at","or","from","that","this","it","was","were","can","may"]);
export function tokenize(s: string){ return s.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(t=>t && !STOP.has(t)); }
export function bm25Scores(query: string, docs: {id:number; text:string}[]) {
  const q = tokenize(query);
  const N = docs.length, avgdl = docs.reduce((s,d)=>s+d.text.length,0)/Math.max(1,N);
  const k1=1.5, b=0.75;
  const df = new Map<string,number>();
  const tfs = docs.map(d=>{
    const tf = new Map<string,number>();
    for(const w of tokenize(d.text)) tf.set(w,(tf.get(w)||0)+1);
    for(const w of q) if(tf.has(w)) df.set(w,(df.get(w)||0)+1);
    return tf;
  });
  const scores = docs.map((d,i)=>{
    const L = d.text.length; let s = 0;
    for(const w of q){
      const n = df.get(w)||0; if(!n) continue;
      const idf = Math.log(1 + (N - n + 0.5)/(n + 0.5));
      const f = (tfs[i].get(w)||0);
      const denom = f + k1*(1 - b + b*(L/avgdl));
      s += idf * ((f*(k1+1))/(denom+1e-9));
    }
    return {id: d.id, score: s};
  });
  scores.sort((a,b)=>b.score-a.score);
  return scores;
}
export function rrfFuse(primary: {id:number; score:number}[], ...others: {id:number; score:number}[]){
  const k = 60; const lists = [primary, ...others]; const acc = new Map<number,number>();
  for(const L of lists){ L.forEach((r, idx)=>{ const s = 1/(k+idx+1); acc.set(r.id, (acc.get(r.id)||0) + s); }); }
  return Array.from(acc.entries()).map(([id,score])=>({id,score})).sort((a,b)=>b.score-a.score);
}