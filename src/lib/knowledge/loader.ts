import * as fs from "fs";
import * as path from "path";
import { SourceDocumentSchema, type SourceDocument } from "@/lib/schemas";

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns the frontmatter fields and the body text.
 */
function parseFrontmatter(raw: string): {
  title: string;
  url: string;
  capturedAt: string;
  body: string;
} {
  if (!raw.startsWith("---")) {
    throw new Error("Missing frontmatter");
  }
  const end = raw.indexOf("---", 3);
  if (end === -1) throw new Error("Unclosed frontmatter");
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 3).trim();

  const get = (key: string): string => {
    const m = fm.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
    return m ? m[1].trim() : "";
  };

  return {
    title: get("title"),
    url: get("url"),
    capturedAt: get("capturedAt"),
    body,
  };
}

let _cache: SourceDocument[] | null = null;

/** Load all markdown sources from data/sources/. Cached after first load. */
export function loadSources(): SourceDocument[] {
  if (_cache) return _cache;

  const dir = path.join(process.cwd(), "data", "sources");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  _cache = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { title, url, capturedAt, body } = parseFrontmatter(raw);
    const id = file.replace(".md", "");
    const doc = SourceDocumentSchema.parse({
      id,
      title,
      url,
      capturedAt,
      text: body,
    });
    return doc;
  });

  return _cache;
}

/** Reset cache (for tests). */
export function resetSourceCache(): void {
  _cache = null;
}
