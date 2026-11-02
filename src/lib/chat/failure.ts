export type FailureCategory =
  | "invalid_key"
  | "blocked"
  | "model_not_found"
  | "rate_limit"
  | "timeout"
  | "empty_text"
  | "mock_demo"
  | "unexpected";

export interface ModelFailure {
  category: FailureCategory;
  status: number | null;
  reason: string;
}

export const FAILURE_REASONS: Record<FailureCategory, string> = {
  invalid_key: "The AI service did not accept this site's access key.",
  blocked: "The AI service has blocked access for this project.",
  model_not_found: "The configured AI model is not available.",
  rate_limit: "The AI service's free usage limit was reached for now.",
  timeout: "The AI service did not respond in time.",
  empty_text: "The AI service returned no text for this question.",
  unexpected: "The AI service returned an unexpected error.",
  mock_demo: "No AI model is connected, so this is a demo answer.",
};

export const UNRELATED_REDIRECT_MESSAGE =
  "That is outside what I can help with. I can help with Sea View Skydiving and Greedy Adventures: packages, prices, what is included, the day plan, location, and sending the brochure or video.";

export function classifyModelError(err: unknown): ModelFailure {
  if (!err) {
    return {
      category: "unexpected",
      status: null,
      reason: FAILURE_REASONS.unexpected,
    };
  }

  const customCategory = (err as { category?: FailureCategory }).category;
  if (customCategory && FAILURE_REASONS[customCategory]) {
    const status = extractStatusCode(err);
    return {
      category: customCategory,
      status,
      reason: FAILURE_REASONS[customCategory],
    };
  }

  const status = extractStatusCode(err);
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  const name = err instanceof Error ? err.name.toLowerCase() : "";

  if (
    status === 400 ||
    status === 401 ||
    msg.includes("api key") ||
    msg.includes("400") ||
    msg.includes("401")
  ) {
    return {
      category: "invalid_key",
      status: status ?? (msg.includes("401") ? 401 : 400),
      reason: FAILURE_REASONS.invalid_key,
    };
  }

  if (
    status === 403 ||
    msg.includes("403") ||
    msg.includes("blocked") ||
    msg.includes("permission_denied")
  ) {
    return {
      category: "blocked",
      status: 403,
      reason: FAILURE_REASONS.blocked,
    };
  }

  if (status === 404 || msg.includes("404") || msg.includes("not found")) {
    return {
      category: "model_not_found",
      status: 404,
      reason: FAILURE_REASONS.model_not_found,
    };
  }

  if (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted")
  ) {
    return {
      category: "rate_limit",
      status: 429,
      reason: FAILURE_REASONS.rate_limit,
    };
  }

  const errCode = (err as { code?: string }).code?.toLowerCase() ?? "";

  if (
    status === 408 ||
    status === 504 ||
    name.includes("timeout") ||
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("etimedout") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("econnreset") ||
    errCode.includes("timeout") ||
    errCode === "etimedout"
  ) {
    return {
      category: "timeout",
      status: status ?? 504,
      reason: FAILURE_REASONS.timeout,
    };
  }

  if (msg.includes("empty text") || msg.includes("no text")) {
    return {
      category: "empty_text",
      status: null,
      reason: FAILURE_REASONS.empty_text,
    };
  }

  return {
    category: "unexpected",
    status,
    reason: FAILURE_REASONS.unexpected,
  };
}

function extractStatusCode(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const anyErr = err as Record<string, unknown>;

  if (typeof anyErr.statusCode === "number") return anyErr.statusCode;
  if (typeof anyErr.status === "number") return anyErr.status;

  if (anyErr.cause && typeof anyErr.cause === "object") {
    const cause = anyErr.cause as Record<string, unknown>;
    if (typeof cause.statusCode === "number") return cause.statusCode;
    if (typeof cause.status === "number") return cause.status;
  }

  if (anyErr.lastError && typeof anyErr.lastError === "object") {
    const last = anyErr.lastError as Record<string, unknown>;
    if (typeof last.statusCode === "number") return last.statusCode;
    if (typeof last.status === "number") return last.status;
  }

  if (
    Array.isArray(anyErr.errors) &&
    anyErr.errors[0] &&
    typeof anyErr.errors[0] === "object"
  ) {
    const first = anyErr.errors[0] as Record<string, unknown>;
    if (typeof first.statusCode === "number") return first.statusCode;
    if (typeof first.status === "number") return first.status;
  }

  return null;
}

export function logFailure(category: FailureCategory, status: number | null): void {
  console.error(`AI service failure: category=${category} status=${status ?? "none"}`);
}

export function isUnrelatedQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  const offTopicPatterns = [
    /\bpython\b/,
    /\bjavascript\b/,
    /\bscript\b/,
    /\bcode\b/,
    /\bprogramming\b/,
    /\brecipe\b/,
    /\bcook\b/,
    /\bpoem\b/,
    /\bpoetry\b/,
    /\bessay\b/,
    /\bcapital of\b/,
    /\bweather in\b/,
    /\btranslate\b/,
    /\bstock\b/,
    /\bcrypto\b/,
    /\bbitcoin\b/,
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(lower)) {
      if (!/\b(skydive|skydiving|jump|dropzone|pattaya|mount abu|greedy|package|tandem)\b/.test(lower)) {
        return true;
      }
    }
  }

  return false;
}
