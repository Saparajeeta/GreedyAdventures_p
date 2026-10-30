"use client";

import { defineToolkit } from "@assistant-ui/react";
import { PdfCard } from "./PdfCard";
import { VideoCard } from "./VideoCard";
import { UnavailableCard } from "./UnavailableCard";
import { ToolSkeleton } from "./ToolSkeleton";

interface ToolItem {
  id: string;
  type: string;
  title: string;
  url: string;
  isDemo: boolean;
  description?: string;
  mimeType?: string;
}

interface ToolResult {
  available: boolean;
  item?: ToolItem;
  reason?: string;
}

export const chatToolkit = defineToolkit({
  getBrochure: {
    type: "backend",
    render: ({ result, status }: { result?: ToolResult; status?: { type?: string } }) => {
      if (status?.type === "running") {
        return <ToolSkeleton label="Preparing brochure..." />;
      }
      if (status?.type === "incomplete") {
        return <UnavailableCard reason="Unable to retrieve brochure." type="brochure" />;
      }
      if (!result) return null;
      if (!result.available || !result.item) {
        return <UnavailableCard reason={result.reason} type="brochure" />;
      }
      return (
        <PdfCard
          title={result.item.title}
          url={result.item.url}
          isDemo={result.item.isDemo}
          description={result.item.description}
        />
      );
    },
  },
  getVideo: {
    type: "backend",
    render: ({ result, status }: { result?: ToolResult; status?: { type?: string } }) => {
      if (status?.type === "running") {
        return <ToolSkeleton label="Preparing jump video..." />;
      }
      if (status?.type === "incomplete") {
        return <UnavailableCard reason="Unable to load video footage." type="video" />;
      }
      if (!result) return null;
      if (!result.available || !result.item) {
        return <UnavailableCard reason={result.reason} type="video" />;
      }
      return (
        <VideoCard
          title={result.item.title}
          url={result.item.url}
          isDemo={result.item.isDemo}
          description={result.item.description}
        />
      );
    },
  },
});
