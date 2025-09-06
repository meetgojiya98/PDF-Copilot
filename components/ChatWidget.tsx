"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square, Quote, Clipboard, Check } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

type Msg = { role: "user" | "assistant"; content: string };
type QuoteT = { idx: number; title: string; quote: string };

export default function ChatWidget() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Ask me anything about your uploaded documents." },
  ]);
  const [input, setInput] = useState("What are the pre-operative fasting instructions?");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<QuoteT[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setQuotes([]);
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: ctrl.signal,
      });

      if (!r.ok || !r.body) {
        toast.error("Ask failed. Check server logs.");
        setLoading(false);
        return;
      }

      const reader = r.body.getReader();
      const dec = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.trim()) continue;
          const j = JSON.parse(line);
          if (j.type === "meta") setQuotes(j.quotes || []);
          else if (j.type === "token") {
            setMessages((m) => {
              const next = [...m];
              const last = next[next.length - 1];
              if (last?.role === "assistant") last.content += j.token;
              return next;
            });
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Chat</h2>
          <p className="text-sm text-textDim">Streaming answers grounded in your docs.</p>
        </div>
      </div>

      {/* Chat card */}
      <div className="card p-4 md:p-6">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {messages.map((m, i) => (
            <AnimatePresence key={i}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed border",
                    m.role === "user"
                      ? "bg-primary/20 border-primary/30"
                      : "bg-panel border-border"
                  )}
                >
                  {m.content}
                </div>
              </motion.div>
            </AnimatePresence>
          ))}
          <div ref={endRef} />
        </div>

        {/* Key quotes */}
        <AnimatePresence>
          {quotes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid md:grid-cols-2 gap-3"
            >
              {quotes.map((q) => (
                <div key={q.idx} className="card p-4 relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs uppercase tracking-wider text-textDim">
                      <Quote className="inline w-4 h-4 mr-1" /> Quote #{q.idx}
                    </div>
                    <button
                      className="text-xs text-textDim hover:text-white inline-flex items-center gap-1"
                      onClick={async () => {
                        await navigator.clipboard.writeText(q.quote);
                        setCopiedIdx(q.idx);
                        setTimeout(() => setCopiedIdx(null), 1200);
                      }}
                    >
                      {copiedIdx === q.idx ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />} Copy
                    </button>
                  </div>
                  <div className="text-sm">{q.quote}{q.quote.length >= 220 ? "…" : ""}</div>
                  <div className="text-xs text-textDim mt-2">{q.title}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="mt-4 flex items-center gap-2">
          <input
            className="input"
            placeholder="Ask about your docs…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? send() : undefined)}
          />
          {loading ? (
            <button onClick={stop} className="btn-ghost px-3 py-2 rounded-xl" title="Stop">
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={send} className="btn px-4 py-2 rounded-xl" title="Send">
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
