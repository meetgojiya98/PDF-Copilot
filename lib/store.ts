import fs from "fs"; import path from "path"; import Database from "better-sqlite3";
export type Chunk = { title:string; content:string; embedding:number[] };
function dbPath(){ const p = process.env.DB_PATH || "./data/pau.db"; return path.join(process.cwd(), p); }
function open(){ const p = dbPath(); fs.mkdirSync(path.dirname(p), {recursive:true}); const db = new Database(p); db.pragma("journal_mode=WAL"); db.exec(`CREATE TABLE IF NOT EXISTS chunks(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT, content TEXT);`); return db; }
export function insertChunks(rows: {title:string;content:string}[]){ const db = open(); const stmt = db.prepare("INSERT INTO chunks(title,content) VALUES(?,?)"); const tx = db.transaction((rows: {title:string;content:string}[])=>{ for(const r of rows) stmt.run(r.title, r.content); }); tx(rows); db.close(); }
export function allChunks(): Chunk[]{ const db = open(); const rows = db.prepare("SELECT title, content FROM chunks").all() as any[]; db.close(); return rows.map(r=>({ title:r.title, content:r.content, embedding: [] })); }
export function listDocs(){ const db = open(); const rows = db.prepare("SELECT title, COUNT(*) AS count FROM chunks GROUP BY title").all() as any[]; db.close(); return rows; }
export function deleteDoc(title:string){ const db = open(); const info = db.prepare("DELETE FROM chunks WHERE title=?").run(title); db.close(); return { removed: info.changes||0 }; }
export function cosine(a:number[], b:number[]){ let dot=0,na=0,nb=0; for(let i=0;i<a.length;i++){ const x=a[i], y=b[i]; dot+=x*y; na+=x*x; nb+=y*y; } return dot/(Math.sqrt(na)*Math.sqrt(nb)+1e-9); }
