export default function Home() {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20">
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Your local <span className="text-primary">AI copilot</span> for PDFs.
            </h1>
            <p className="text-lg text-textDim">
              Upload docs, ask questions, get grounded answers with inline citations — all
              running locally via Ollama. No keys, no cloud.
            </p>
            <div className="flex gap-3">
              <a className="btn" href="/admin">Upload &amp; Index</a>
              <a className="btn btn-ghost" href="/embed">Open Chat</a>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3 pt-4 text-sm text-textDim">
              <li className="card p-4">Hybrid retrieval (vector + BM25 + RRF)</li>
              <li className="card p-4">Optional LLM rerank</li>
              <li className="card p-4">Auto-OCR for scanned PDFs</li>
              <li className="card p-4">Streaming answers + quotes</li>
            </ul>
          </div>
          <div className="card p-6 lg:p-10">
            <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 border border-border grid place-items-center">
              <div className="text-center px-6">
                <div className="text-sm uppercase tracking-widest text-textDim mb-2">Demo</div>
                <div className="text-xl font-semibold">“What are the pre-op fasting rules?”</div>
                <div className="mt-4 text-textDim">“Adults: stop solid food 8h before; clear liquids allowed until 2h prior [#1].”</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
  