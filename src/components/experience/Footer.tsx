import Link from "next/link";
import { Database, FileText, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-brand-teal/20 bg-brand-dark text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Credit */}
          <div className="md:col-span-2 space-y-4">
            <div className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
              Greedy Adventures
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Content and media from{" "}
              <a
                href="https://www.greedyadventures.com/experiences/sea-view-skydiving"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-amber underline hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
              >
                greedyadventures.com
              </a>
              , used for a take-home prototype.
            </p>
            <div className="inline-flex items-center gap-2 rounded bg-white/5 px-2.5 py-1 text-xs text-slate-300 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-amber" aria-hidden="true" />
              <span>Take-Home Prototype * Read-Only Grounded Knowledge</span>
            </div>
          </div>

          {/* Verification & Knowledge Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-amber">
              Verification & Architecture
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/knowledge"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
                >
                  <Database className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
                  <span>Knowledge View & Pipeline Test</span>
                </Link>
              </li>
              <li>
                <a
                  href="/media/sea-view-skydiving-brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
                  <span>Sample Brochure (Demo Material)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
                  <span>Real Jump Video Stream</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Demo Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-amber">
              Demo Material Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All PDF brochures are generated as <strong className="text-slate-200">Demo material</strong> based
              strictly on verified page facts. Unlisted requirements (e.g. strict medical or weight limits) are purposely unanswerable to ensure strict hallucination prevention.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Greedy Adventures Prototype. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/knowledge"
              className="text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
            >
              /knowledge
            </Link>
            <a
              href="https://www.greedyadventures.com/cancellations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
            >
              Cancellations policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
