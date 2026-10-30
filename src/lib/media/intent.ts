export interface MediaIntent {
  brochure: boolean;
  video: boolean;
  matched: string[];
}

interface IntentRule {
  key: "brochure" | "video";
  pattern: RegExp;
  label: string;
}

const RULES: IntentRule[] = [
  {
    key: "brochure",
    pattern: /\b(brochure|pdf|flyer|leaflet)\b/i,
    label: "brochure",
  },
  {
    key: "video",
    pattern: /\b(video|footage|clip|watch)\b/i,
    label: "video",
  },
];

/**
 * Detect media intent from user text.
 * Conservative: only triggers on exact word-boundary matches.
 */
export function detectMediaIntent(text: string): MediaIntent {
  const result: MediaIntent = { brochure: false, video: false, matched: [] };

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      result[rule.key] = true;
      result.matched.push(rule.label);
    }
  }

  return result;
}
