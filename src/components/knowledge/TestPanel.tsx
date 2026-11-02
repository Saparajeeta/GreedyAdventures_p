"use client";

import React, { useState } from "react";
import { Send, Loader2, AlertCircle, FileText, Film } from "lucide-react";

interface ChunkTrace {
  title: string;
  url: string;
  heading: string;
  score: number;
  text: string;
}

interface MediaItemTrace {
  type: string;
  title: string;
  url: string;
  isDemo: boolean;
  description: string;
}

interface TestTrace {
  question: string;
  retrievalQuery: string;
  chunks: ChunkTrace[];
  contextSentToModel: string;
  intentMatched: string[];
  mediaSelected: {
    pdf: MediaItemTrace | null;
    video: MediaItemTrace | null;
  };
  mode: "mock" | "live";
  modelId: string;
  latencyMs: number;
  answer: string;
}

const SUGGESTIONS = [
  "What is included in the packages?",
  "How much is VIP?",
  "Can I see a video of the jump?",
];

export function TestPanel({ mode }: { mode: string }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<TestTrace | null>(null);

  async function handleAsk(q?: string) {
    const text = (q ?? question).trim();
    if (!text) return;
    if (q) setQuestion(q);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/knowledge/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }
      setTrace(data as TestTrace);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="space-y-2"
      >
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="Type a question..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal disabled:opacity-60"
          />
          <div className="absolute right-2 top-2">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Asking</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Ask</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400">Suggestions:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAsk(s)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-brand-teal hover:text-brand-teal transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !trace && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-2">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-teal" />
          <p className="text-xs text-slate-600">Thinking...</p>
        </div>
      )}

      {/* Results */}
      {trace && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          {/* Answer */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-2">
              Answer
            </h3>
            <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
              {trace.answer}
            </p>
          </div>

          {/* Website text used */}
          {trace.chunks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700">
                Website text used ({trace.chunks.length} closest
                {trace.chunks.length === 1 ? " match" : " matches"})
              </h3>
              {trace.chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-800">
                      {chunk.heading || "Section"}{" "}
                      <span className="font-normal text-slate-500">
                        from {chunk.title}
                      </span>
                    </span>
                    {idx === 0 && (
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Closest match
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed">
                    {chunk.text}
                  </p>
                  <a
                    href={chunk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[11px] text-brand-teal underline"
                  >
                    Source page
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* File shared in the chat */}
          {(trace.mediaSelected.pdf || trace.mediaSelected.video) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700">
                File shared in the chat
              </h3>
              <div className="flex flex-wrap gap-2">
                {trace.mediaSelected.pdf && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {trace.mediaSelected.pdf.title}
                      </span>
                      {trace.mediaSelected.pdf.isDemo && (
                        <span className="ml-1.5 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] text-amber-800">
                          Demo material
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {trace.mediaSelected.video && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs flex items-center gap-2">
                    <Film className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {trace.mediaSelected.video.title}
                      </span>
                      {!trace.mediaSelected.video.isDemo && (
                        <span className="ml-1.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-800">
                          From greedyadventures.com
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!trace.mediaSelected.pdf &&
            !trace.mediaSelected.video &&
            trace.intentMatched.length > 0 && (
              <p className="text-xs text-slate-500">
                No file to share for this question.
              </p>
            )}

          {/* Collapsed: exact text sent to the AI */}
          <details className="group text-xs">
            <summary className="cursor-pointer font-bold text-slate-700 hover:text-slate-900 list-none flex items-center justify-between">
              <span>Show the exact text sent to the AI</span>
              <span className="text-slate-400 group-open:hidden">▼</span>
              <span className="text-slate-400 hidden group-open:inline">
                ▲
              </span>
            </summary>
            <pre className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
              {trace.contextSentToModel}
            </pre>
          </details>

          {/* Collapsed: technical details */}
          <details className="group text-xs">
            <summary className="cursor-pointer font-bold text-slate-700 hover:text-slate-900 list-none flex items-center justify-between">
              <span>Technical details</span>
              <span className="text-slate-400 group-open:hidden">▼</span>
              <span className="text-slate-400 hidden group-open:inline">
                ▲
              </span>
            </summary>
            <div className="mt-2 rounded-xl bg-slate-100 p-3 space-y-1.5">
              <p>
                <span className="font-semibold text-slate-700">Mode:</span>{" "}
                {mode}
              </p>
              <p>
                <span className="font-semibold text-slate-700">
                  Response time:
                </span>{" "}
                {trace.latencyMs < 1000
                  ? `${trace.latencyMs}ms`
                  : `${(trace.latencyMs / 1000).toFixed(1)}s`}
              </p>
              <p>
                <span className="font-semibold text-slate-700">
                  Text sections matched:
                </span>{" "}
                {trace.chunks.length}
              </p>
              {trace.intentMatched.length > 0 && (
                <p>
                  <span className="font-semibold text-slate-700">
                    File request detected:
                  </span>{" "}
                  {trace.intentMatched.join(", ")}
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
