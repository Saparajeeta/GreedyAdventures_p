import * as fs from "fs";
import * as path from "path";
import { MediaRegistrySchema, type MediaItem } from "@/lib/schemas";

/**
 * URL allowlist: own /media paths + hosts from media.json items.
 * Non-allowlisted URLs are rejected.
 */
const ALLOWED_HOSTS: Set<string> = new Set();
const ALLOWED_PATH_PREFIX = "/media/";

let _items: MediaItem[] | null = null;

function loadRegistry(): MediaItem[] {
  if (_items) return _items;

  const raw = fs.readFileSync(
    path.join(process.cwd(), "data", "media.json"),
    "utf-8"
  );
  const parsed = MediaRegistrySchema.parse(JSON.parse(raw));
  _items = parsed.items;

  // Build allowlist from item URLs
  for (const item of _items) {
    try {
      const u = new URL(item.url);
      ALLOWED_HOSTS.add(u.hostname);
    } catch {
      // relative path — allowed via prefix
    }
  }

  return _items;
}

export function selectMedia(type: "pdf" | "video"): MediaItem | null {
  const items = loadRegistry();
  return items.find((i) => i.type === type) ?? null;
}

export function isAllowedUrl(url: string): boolean {
  // Relative /media/ paths
  if (url.startsWith(ALLOWED_PATH_PREFIX)) return true;

  try {
    const u = new URL(url);
    return ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/** Reset registry cache (for tests). */
export function resetRegistry(): void {
  _items = null;
  ALLOWED_HOSTS.clear();
}
