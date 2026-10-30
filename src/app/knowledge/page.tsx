import React from "react";
import Link from "next/link";
import { ArrowLeft, Database, FileText, Film, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { loadSources } from "@/lib/knowledge/loader";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { loadRegistry } from "@/lib/media/registry";
import { isMockMode, getModelId } from "@/lib/chat/model";
import { TestPanel } from "@/components/knowledge/TestPanel";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const sources = await loadSources();
  const mediaItems = loadRegistry();
  const mockMode = isMockMode();
  const modelId = getModelId();

  // Compute chunk counts per source
  const sourcesWithChunks = sources.map((src) => {
    const chunks = chunkDocument(src);
    return {
      ...src,
      chunkCount: chunks.length,
      chunks,
    };
  });

  const totalChunks = sourcesWithChunks.reduce((acc, s) => acc + s.chunkCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sea View Skydiving</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <h1 className="font-serif text-lg font-bold text-slate-900 hidden sm:block">
              Knowledge Base &amp; Pipeline Inspector
            </h1>
          </div>

          {/* Mode Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                !mockMode
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  !mockMode ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {!mockMode ? `Live: ${modelId}` : "Mock mode"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 space-y-8">
        {/* Intro Banner */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-teal mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>Auditable Grounded Knowledge</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Grounding Knowledge Sources &amp; Retrieval Inspector
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                This read-only view lists all static markdown snapshots scraped from greedyadventures.com and the allowed media registry. The test panel below executes the live BM25 retrieval and inference pipeline.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">{sources.length}</span> Verified Sources
            </div>
            <div>•</div>
            <div>
              <span className="font-semibold text-slate-700">{totalChunks}</span> Headings Chunks (≤800 chars)
            </div>
            <div>•</div>
            <div>
              <span className="font-semibold text-slate-700">{mediaItems.length}</span> Registered Media
            </div>
            <div>•</div>
            <div>
              BM25 Retrieval (<span className="font-mono">k1=1.2, b=0.75</span>)
            </div>
          </div>
        </section>

        {/* Live Test Panel */}
        <section aria-labelledby="test-panel-heading">
          <TestPanel />
          <p className="mt-2 text-center text-xs text-slate-500">
            Runs the same pipeline as the chat. Shows only this test run; visitor chats are never stored or displayed.
          </p>
        </section>

        {/* Knowledge Sources Grid */}
        <section aria-labelledby="sources-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-teal" />
            <h2 id="sources-heading" className="text-base font-bold text-slate-900">
              Loaded Knowledge Snapshots ({sources.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sourcesWithChunks.map((source, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {source.title}
                    </h3>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-block text-xs font-medium text-brand-teal underline"
                    >
                      {source.url}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      captured: {source.capturedAt}
                    </span>
                    <span className="rounded bg-brand-teal/10 px-2 py-0.5 font-semibold text-[11px] text-brand-teal">
                      {source.chunkCount} chunks
                    </span>
                  </div>
                </div>

                {/* Collapsible raw text details */}
                <details className="group border-t border-slate-100 pt-2 text-xs">
                  <summary className="cursor-pointer font-medium text-slate-500 hover:text-slate-800 transition-colors list-none flex items-center justify-between">
                    <span>Show complete text usable by the bot</span>
                    <span className="text-[11px] text-slate-400 group-open:hidden">▼ expand</span>
                    <span className="text-[11px] text-slate-400 hidden group-open:inline">▲ collapse</span>
                  </summary>
                  <pre className="mt-2.5 max-h-64 overflow-y-auto rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {source.text}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* Media Registry Section */}
        <section aria-labelledby="media-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-brand-teal" />
            <h2 id="media-heading" className="text-base font-bold text-slate-900">
              Media Registry ({mediaItems.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === "pdf" ? (
                      <FileText className="h-4 w-4 text-brand-teal" />
                    ) : (
                      <Film className="h-4 w-4 text-brand-teal" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {item.type}
                    </span>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                      item.isDemo
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {item.isDemo ? "Demo" : "Real"}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-brand-teal underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
