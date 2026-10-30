"use client";

import React, { useState } from "react";
import { Film, ExternalLink, AlertCircle } from "lucide-react";

export interface VideoCardProps {
  title: string;
  url: string;
  isDemo?: boolean;
  description?: string;
}

export function VideoCard({ title, url, isDemo = false, description }: VideoCardProps) {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="my-2 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm max-w-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded bg-brand-teal/10 p-1.5 text-brand-teal">
            <Film className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Jump Video
          </span>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
            isDemo
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {isDemo ? "Demo material" : "From greedyadventures.com"}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-2">
        {title}
      </h4>

      {!loadError ? (
        <video
          controls
          preload="metadata"
          playsInline
          src={url}
          onError={() => setLoadError(true)}
          className="w-full rounded bg-black aspect-video object-cover"
        />
      ) : (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Video could not be played directly in browser.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-medium text-brand-teal underline hover:text-brand-teal/80"
              >
                Watch video on greedyadventures.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {description && (
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
