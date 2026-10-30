import React from "react";
import { Loader2 } from "lucide-react";

export function ToolSkeleton({ label = "Preparing..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="my-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 max-w-sm text-xs text-slate-600 animate-pulse"
    >
      <Loader2 className="h-4 w-4 animate-spin text-brand-teal shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
