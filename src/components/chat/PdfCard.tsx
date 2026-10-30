import React from "react";
import { FileText, ExternalLink, Download } from "lucide-react";

export interface PdfCardProps {
  title: string;
  url: string;
  isDemo?: boolean;
  description?: string;
}

export function PdfCard({ title, url, isDemo = true, description }: PdfCardProps) {
  return (
    <div className="my-2 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm max-w-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded bg-brand-teal/10 p-1.5 text-brand-teal">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            PDF Brochure
          </span>
        </div>
        {isDemo && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 border border-amber-200">
            Demo material
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
        {title}
      </h4>

      {description && (
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded bg-brand-teal px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-teal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-1"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Open
        </a>
        <a
          href={url}
          download
          className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-1"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download
        </a>
      </div>
    </div>
  );
}
