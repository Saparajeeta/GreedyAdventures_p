import React from "react";
import { Link2 } from "lucide-react";

export interface SourceItem {
  title: string;
  url: string;
}

export function SourceChips({ sources }: { sources: SourceItem[] }) {
  if (!sources || sources.length === 0) return null;

  // Deduplicate sources by URL
  const uniqueSources = sources.filter(
    (item, index, self) => index === self.findIndex((s) => s.url === item.url)
  );

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-100">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
        Sources referenced
      </p>
      <div className="flex flex-wrap gap-1.5">
        {uniqueSources.map((source, idx) => {
          // Format short title
          const shortTitle = source.title
            .replace(/—.*$/, "")
            .replace(/Greedy Adventures/i, "")
            .trim() || source.title;

          return (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-brand-teal/10 hover:text-brand-teal border border-slate-200/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              title={source.title}
            >
              <Link2 className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate max-w-[180px]">{shortTitle}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
