import React from "react";
import { AlertCircle } from "lucide-react";

export interface UnavailableCardProps {
  reason?: string;
  type?: "brochure" | "video" | "file";
}

export function UnavailableCard({ reason, type = "file" }: UnavailableCardProps) {
  return (
    <div className="my-2 rounded-lg border border-slate-200 bg-slate-50 p-3 max-w-sm">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-slate-700">
          <p className="font-medium text-slate-900">
            {type === "brochure"
              ? "Brochure unavailable"
              : type === "video"
              ? "Video unavailable"
              : "File unavailable"}
          </p>
          <p className="mt-0.5 text-slate-600">
            {reason || "The requested material is currently not available."}
          </p>
        </div>
      </div>
    </div>
  );
}
