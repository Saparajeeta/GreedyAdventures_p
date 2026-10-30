import { type SourceDocument } from "@/lib/schemas";

export type LocationLabel = "Pattaya" | "Mount Abu" | "General";

export interface Chunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  location: LocationLabel;
  heading: string;
  text: string;
}

const MAX_CHUNK_CHARS = 1000;

export function determineLocation(doc: SourceDocument): LocationLabel {
  const id = doc.id.toLowerCase();
  const url = doc.url.toLowerCase();
  if (id.includes("mount-abu") || url.includes("mount-abu")) return "Mount Abu";
  if (
    id.includes("sea-view") ||
    url.includes("sea-view") ||
    id.includes("pattaya") ||
    url.includes("pattaya") ||
    id.includes("contact")
  ) {
    return "Pattaya";
  }
  return "General";
}

/**
 * Split a source document into chunks by markdown heading (## or ###).
 * Each chunk is <= MAX_CHUNK_CHARS characters. Heading text becomes the chunk heading.
 */
export function chunkDocument(doc: SourceDocument): Chunk[] {
  const location = determineLocation(doc);
  const lines = doc.text.split("\n");
  const chunks: Chunk[] = [];

  let currentHeading = "(intro)";
  let currentLines: string[] = [];
  let chunkIndex = 0;

  function flush() {
    const text = currentLines.join("\n").trim();
    if (!text) return;

    // Further split if over limit
    const segments = splitByLength(text, MAX_CHUNK_CHARS);
    for (const segment of segments) {
      chunks.push({
        id: `${doc.id}-${chunkIndex++}`,
        sourceId: doc.id,
        sourceTitle: doc.title,
        sourceUrl: doc.url,
        location,
        heading: currentHeading,
        text: segment,
      });
    }
    currentLines = [];
  }

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      flush();
      currentHeading = line.replace(/^#{1,3}\s+/, "").trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return chunks;
}

function splitByLength(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Try to break at a newline near maxLen
    let end = Math.min(i + maxLen, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf("\n", end);
      if (nl > i) end = nl;
    }
    parts.push(text.slice(i, end).trim());
    i = end;
  }
  return parts.filter(Boolean);
}

export function chunkAllSources(sources: SourceDocument[]): Chunk[] {
  return sources.flatMap(chunkDocument);
}
