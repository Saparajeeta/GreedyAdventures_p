import Link from "next/link";
import { MessageSquare, Database, Sparkles, FileText, Video } from "lucide-react";

export function ChatPlaceholder() {
  return (
    <section
      id="chat-assistant"
      aria-labelledby="assistant-title"
      className="scroll-mt-16 py-16 px-4 sm:px-6 lg:px-8 bg-brand-teal text-white"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-brand-surface/70 backdrop-blur-md p-8 sm:p-10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-amber">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive AI Assistant</span>
            </div>
            <h2
              id="assistant-title"
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Ask our Sea View Skydiving Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Grounded exclusively in greedyadventures.com verified knowledge sources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="#chat-assistant"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal shadow transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Launch Chat</span>
            </a>
            <Link
              href="/knowledge"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-amber px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-dark shadow transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>Knowledge View</span>
            </Link>
          </div>
        </div>

        {/* Demo query pills */}
        <div className="pt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Try asking these in the assistant:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-sand">
                <MessageSquare className="w-3.5 h-3.5 text-brand-amber" aria-hidden="true" />
                <span>Text Q&amp;A</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                &ldquo;What is included in the DELUXE package?&rdquo;
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-sand">
                <FileText className="w-3.5 h-3.5 text-brand-amber" aria-hidden="true" />
                <span>Brochure Delivery</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                &ldquo;Send me a brochure&rdquo; &rarr; PDF card with Open &amp; Download.
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-sand">
                <Video className="w-3.5 h-3.5 text-brand-amber" aria-hidden="true" />
                <span>Video Reel</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                &ldquo;Can I see a video?&rdquo; &rarr; Direct 4K jump video player.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
