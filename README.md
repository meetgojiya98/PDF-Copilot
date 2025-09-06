# PDF Copilot (LangChain + Ollama, local/free)

Features:
- Upload PDFs/TXT → chunk → Ollama embeddings (nomic-embed-text) → HNSW vector index
- Hybrid retrieval = vector (HNSWLib) + keyword (BM25-lite) fused with RRF
- Optional LLM reranker (toggle `RERANK_LLM=true`)
- Auto-OCR fallback for scanned PDFs (ocrmypdf + pdftotext)
- Streaming answers (NDJSON) + quoted snippets
- SQLite for chunk store

## Screenshots

<img width="3020" height="1508" alt="image" src="https://github.com/user-attachments/assets/347f76cb-80a5-4915-a049-21197a879e6e" />

<img width="3020" height="1508" alt="image" src="https://github.com/user-attachments/assets/9d330bb3-9f37-419a-bc26-28a18d32999f" />

<img width="3020" height="1508" alt="image" src="https://github.com/user-attachments/assets/3638e451-4402-4ed5-a31b-215eac56ed62" />


## Prereqs
- Node 18+
- Ollama running locally
  ```bash
  brew services start ollama
  ollama pull nomic-embed-text
  ollama pull llama3.1:8b
  ```
- (optional OCR) `brew install ocrmypdf poppler tesseract`

## Run
```bash
cp .env.example .env.local
npm i
npm run dev
# open http://localhost:3000/admin (upload) and http://localhost:3000/embed (chat)
```
