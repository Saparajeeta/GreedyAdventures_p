"use client";

import React, { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, FileText, Film, Sparkles, Terminal } from "lucide-react";

interface ChunkTrace {
  title: string;
  url: string;
  heading: string;
  score: number;
  text: string;
}

interface TestTrace {
  question: string;
  retrievalQuery: string;
  chunks: ChunkTrace[];
  contextSentToModel: string;
  matchedKeywords: string[];
  mediaSelected: {
    brochure: string | null;
    video: string | null;
  };
  mode: "mock" | "live";
  modelId: string;
  latencyMs: number;
  answer: string;
}

const SAMPLE_QUESTIONS = [
  "What is included in the packages?",
  "Send me a brochure",
  "Can I see a video of the jump?",
  "Send me a brochure and a video",
  "What is the weight limit for a tandem jump?",
  "Is parking available at the dropzone?",
];

export function TestPanel() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<TestTrace | null>(null);

  async function handleTest(testQ?: string) {
    const q = (testQ ?? question).trim();
    if (!q) return;
    if (testQ) setQuestion(testQ);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/knowledge/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: Request failed`);
      }

      setTrace(data as TestTrace);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run pipeline test.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="h-4 w-4 text-brand-teal" />
          <h2 className="text-base font-bold text-slate-900">
            Pipeline Test Panel
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Execute the live retrieval and grounded inference pipeline against the static snapshot index.
        </p>
      </div>

      {/* Query Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleTest();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="Type a question (max 300 characters)..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal disabled:opacity-60"
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
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Run Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Character count & sample chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium">Try:</span>
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleTest(q)}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-brand-teal hover:text-brand-teal transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <span className="text-slate-400 text-[11px]">
            {question.length}/300 chars
          </span>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Pipeline Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !trace && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center animate-pulse space-y-3">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-teal" />
          <p className="text-xs text-slate-600 font-medium">
            Running BM25 retrieval and model pipeline...
          </p>
        </div>
      )}

      {/* Results Inspector */}
      {trace && (
        <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
          {/* Status Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/70 p-3 text-xs">
            <span className="font-semibold text-slate-700">Execution Metadata:</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                trace.mode === "live"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  trace.mode === "live" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              Mode: {trace.mode} ({trace.modelId})
            </span>
            <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
              Latency: {trace.latencyMs}ms
            </span>
            <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
              Chunks Retrieved: {trace.chunks.length}
            </span>
          </div>

          {/* Generated Answer */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-teal mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Grounded Model Answer</span>
            </div>
            <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
              {trace.answer}
            </p>
          </div>

          {/* Media & Intent Detection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <p className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
                <span>Matched Intent Keywords</span>
              </p>
              {trace.matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trace.matchedKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-brand-teal/10 px-2 py-0.5 font-mono text-[11px] text-brand-teal font-medium"
                    >
                      &quot;{kw}&quot;
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">none detected (plain question)</span>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <p className="font-semibold text-slate-700 mb-1.5">Selected Media</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">Brochure:</span>
                  <span className="truncate">
                    {trace.mediaSelected.brochure || <span className="text-slate-400 italic">none</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Film className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">Video:</span>
                  <span className="truncate">
                    {trace.mediaSelected.video || <span className="text-slate-400 italic">none</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Retrieved Chunks with BM25 Scores */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Retrieved Chunks (BM25 Ranked)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Query: &quot;{trace.retrievalQuery}&quot;
              </span>
            </div>
            <div className="space-y-2">
              {trace.chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {chunk.heading || "Section"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({chunk.title})
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                      score: {chunk.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed">
                    {chunk.text}
                  </p>
                  <a
                    href={chunk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-[11px] font-medium text-brand-teal underline"
                  >
                    {chunk.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Exact Context Sent To Model */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Exact Context Sent to Model (Prompt Snippet)
            </h3>
            <pre className="max-h-60 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
              {trace.contextSentToModel}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
