import { tool } from "ai";
import { z } from "zod";
import { selectMedia } from "@/lib/media/registry";
import type { MediaItem } from "@/lib/schemas";

type ToolResult =
  | { available: true; item: MediaItem }
  | { available: false; reason: string };

export async function getBrochureResult(): Promise<ToolResult> {
  const item = selectMedia("pdf");
  if (!item) return { available: false, reason: "No brochure on file." };
  return { available: true, item };
}

export async function getVideoResult(): Promise<ToolResult> {
  const item = selectMedia("video");
  if (!item) return { available: false, reason: "No video on file." };
  return { available: true, item };
}

export const getBrochure = tool({
  description: "Return the Sea View Skydiving PDF brochure for the user.",
  inputSchema: z.object({}),
  execute: getBrochureResult,
});

export const getVideo = tool({
  description: "Return the Sea View Skydiving jump video for the user.",
  inputSchema: z.object({}),
  execute: getVideoResult,
});
