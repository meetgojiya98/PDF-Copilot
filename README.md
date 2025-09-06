# PDF Copilot (LangChain + Ollama, local/free)

Features:
- Upload PDFs/TXT → chunk → Ollama embeddings (nomic-embed-text) → HNSW vector index
- Hybrid retrieval = vector (HNSWLib) + keyword (BM25-lite) fused with RRF
- Optional LLM reranker (toggle `RERANK_LLM=true`)
- Auto-OCR fallback for scanned PDFs (ocrmypdf + pdftotext)
- Streaming answers (NDJSON) + quoted snippets
- SQLite for chunk store

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
