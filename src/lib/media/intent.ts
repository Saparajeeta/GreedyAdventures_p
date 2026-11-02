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
    pattern: /\b(brochure|pdf|flyer|leaflet|info[\s-]+sheet)\b/i,
    label: "brochure",
  },
  {
    key: "video",
    pattern: /\b(video|footage|clip|reel|film|watch)\b/i,
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

/**
 * Returns true if the user message is solely asking for media (brochure, video),
 * with no other questions or requests.
 */
export function isMediaOnlyRequest(text: string): boolean {
  const intent = detectMediaIntent(text);
  if (!intent.brochure && !intent.video) return false;

  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(
      /\b(brochure|brochures|pdf|pdfs|flyer|flyers|leaflet|leaflets|info[\s-]+sheet|video|videos|footage|clip|clips|reel|film|watch)\b/g,
      " "
    )
    .replace(
      /\b(can|could|would|will|please|send|give|show|share|get|let|see|have|i|me|us|you|to|the|a|an|and|or|of|for|about|with|on|in|at|it|is|any|some|more|info|information|details|experience|skydiving|skydive|jump|sea|view|greedy|adventures|thanks|thank|hi|hello|hey)\b/g,
      " "
    )
    .trim();

  return cleaned.length === 0;
}
