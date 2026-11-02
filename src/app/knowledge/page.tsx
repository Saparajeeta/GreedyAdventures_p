import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Film } from "lucide-react";
import { loadSources } from "@/lib/knowledge/loader";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { loadRegistry } from "@/lib/media/registry";
import { isMockMode, getModelId } from "@/lib/chat/model";
import { TestPanel } from "@/components/knowledge/TestPanel";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function KnowledgePage() {
  const sources = await loadSources();
  const mediaItems = loadRegistry();
  const mockMode = isMockMode();
  const modelId = getModelId();

  const sourcesWithChunks = sources.map((src) => {
    const chunks = chunkDocument(src);
    return { ...src, chunkCount: chunks.length, chunks };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sea View Skydiving</span>
          </Link>

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
            {!mockMode ? `Live answers` : "Mock mode: demo answers"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 space-y-10">
        {/* Title and intro */}
        <section>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            What the assistant knows
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            The chat assistant can only answer from the website pages and files
            listed below. It does not search the internet or remember previous
            visitors.
          </p>
        </section>

        {/* Website pages loaded */}
        <section aria-labelledby="pages-heading" className="space-y-3">
          <h2
            id="pages-heading"
            className="text-base font-bold text-slate-900"
          >
            Website pages loaded ({sources.length})
          </h2>
          <div className="space-y-2">
            {sourcesWithChunks.map((source, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
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
                      className="mt-0.5 inline-block text-xs text-brand-teal underline"
                    >
                      {source.url}
                    </a>
                  </div>
                  <span className="text-xs text-slate-500">
                    Saved on {formatDate(source.capturedAt)}
                  </span>
                </div>

                <details className="mt-2 border-t border-slate-100 pt-2 text-xs group">
                  <summary className="cursor-pointer font-medium text-slate-500 hover:text-slate-800 transition-colors list-none flex items-center justify-between">
                    <span>Show text</span>
                    <span className="text-[11px] text-slate-400 group-open:hidden">
                      ▼
                    </span>
                    <span className="text-[11px] text-slate-400 hidden group-open:inline">
                      ▲
                    </span>
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {source.text}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* Files the assistant can share */}
        <section aria-labelledby="files-heading" className="space-y-3">
          <h2
            id="files-heading"
            className="text-base font-bold text-slate-900"
          >
            Files the assistant can share ({mediaItems.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    {item.type === "pdf" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Film className="h-4 w-4" />
                    )}
                    <span className="text-xs font-semibold uppercase">
                      {item.type === "pdf" ? "Brochure" : "Video"}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                      item.isDemo
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {item.isDemo
                      ? "Demo material"
                      : "From greedyadventures.com"}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600">{item.description}</p>

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Try a question */}
        <section aria-labelledby="test-heading" className="space-y-2">
          <h2
            id="test-heading"
            className="text-base font-bold text-slate-900"
          >
            Try a question
          </h2>
          <p className="text-xs text-slate-500">
            This runs the same process as the chat. Only your test question is
            shown here; visitor chats are never stored or displayed.
          </p>
          <TestPanel
            mode={!mockMode ? `Live: ${modelId}` : "Mock mode"}
          />
        </section>
      </main>
    </div>
  );
}
