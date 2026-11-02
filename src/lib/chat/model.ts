import { wrapLanguageModel } from "ai";
import { createMockModel } from "./mock-model";
import { classifyModelError, logFailure } from "./failure";
import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamPart,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider";

const DEFAULT_GOOGLE_MODEL = "gemini-3.8-flash";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const LIVE_TIMEOUT_MS = 12000;
const BUSY_NOTICE =
  "Shown from the website text because the AI service is busy. Please try again in a minute.";

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("The request timed out");
      (err as { code?: string }).code = "ETIMEDOUT";
      reject(err);
    }, ms);
    Promise.resolve(promise)
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

let _google: ((modelId: string) => LanguageModelV4) | null = null;
let _groq: ((modelId: string) => LanguageModelV4) | null = null;

async function getGoogleModel(modelId: string): Promise<LanguageModelV4> {
  if (!_google) {
    const { google } = await import("@ai-sdk/google");
    _google = google;
  }
  return _google(modelId);
}

async function getGroqModel(modelId: string): Promise<LanguageModelV4> {
  if (!_groq) {
    const { groq } = await import("@ai-sdk/groq");
    _groq = groq;
  }
  return _groq(modelId);
}

function parseMockMode(): boolean {
  const raw = (process.env.MOCK_MODE ?? "").replace(/['" ]/g, "").toLowerCase();
  return raw === "true";
}

function hasGoogleKey(): boolean {
  return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
}

function hasGroqKey(): boolean {
  return !!process.env.GROQ_API_KEY?.trim();
}

export function isMockMode(): boolean {
  if (parseMockMode()) return true;
  return !hasGoogleKey() && !hasGroqKey();
}

export function getPrimaryProvider(): "google" | "groq" {
  const val = (process.env.LLM_PRIMARY ?? "").trim().toLowerCase();
  return val === "groq" ? "groq" : "google";
}

export function getModelId(): string {
  if (isMockMode()) return "mock";
  const primary = getPrimaryProvider();
  if (primary === "groq" && hasGroqKey()) {
    return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  }
  if (hasGoogleKey()) {
    return process.env.GEMINI_MODEL?.trim() || DEFAULT_GOOGLE_MODEL;
  }
  if (hasGroqKey()) {
    return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  }
  return "mock";
}

export function getProviderCandidates(): Array<"google" | "groq"> {
  const primary = getPrimaryProvider();
  const secondary: "google" | "groq" = primary === "groq" ? "google" : "groq";

  const candidates: Array<"google" | "groq"> = [];
  if (primary === "google" && hasGoogleKey()) candidates.push("google");
  if (primary === "groq" && hasGroqKey()) candidates.push("groq");

  if (secondary === "google" && hasGoogleKey() && !candidates.includes("google")) {
    candidates.push("google");
  }
  if (secondary === "groq" && hasGroqKey() && !candidates.includes("groq")) {
    candidates.push("groq");
  }

  return candidates;
}

async function getProviderModel(provider: "google" | "groq"): Promise<LanguageModelV4> {
  if (provider === "google") {
    const modelId = process.env.GEMINI_MODEL?.trim() || DEFAULT_GOOGLE_MODEL;
    return getGoogleModel(modelId);
  }
  const modelId = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  return getGroqModel(modelId);
}

/**
 * Creates a LanguageModelV4 that tries candidates in order (primary then secondary),
 * and if all fail before text is returned, falls back to mock extractive answers
 * with the muted busy notice.
 */
export function createFailoverModel(): LanguageModelV4 {
  return {
    specificationVersion: "v4",
    provider: "failover",
    modelId: getModelId(),
    supportedUrls: {},

    async doGenerate(params: LanguageModelV4CallOptions): Promise<LanguageModelV4GenerateResult> {
      const candidates = getProviderCandidates();

      for (const provider of candidates) {
        try {
          const model = await getProviderModel(provider);
          const res = await withTimeout(model.doGenerate(params), LIVE_TIMEOUT_MS);
          const textParts = res.content.filter((c) => c.type === "text") as Array<{
            type: "text";
            text: string;
          }>;
          const allText = textParts.map((t) => t.text).join("").trim();
          if (!allText) {
            throw new Error("empty text from the model");
          }
          return res;
        } catch (err) {
          const failure = classifyModelError(err);
          logFailure(failure.category, failure.status);
        }
      }

      // If both fail or no keys available, fallback to mock with busy notice
      const fallback = createMockModel({ fallbackNotice: BUSY_NOTICE });
      return fallback.doGenerate(params);
    },

    async doStream(params: LanguageModelV4CallOptions): Promise<LanguageModelV4StreamResult> {
      const candidates = getProviderCandidates();

      const stream = new ReadableStream<LanguageModelV4StreamPart>({
        async start(controller) {
          for (const provider of candidates) {
            try {
              const model = await getProviderModel(provider);
              const streamRes = await withTimeout(model.doStream(params), LIVE_TIMEOUT_MS);
              const reader = streamRes.stream.getReader();
              const buffer: LanguageModelV4StreamPart[] = [];
              let hasText = false;

              while (true) {
                const { done, value } = await withTimeout(reader.read(), LIVE_TIMEOUT_MS);
                if (done) break;
                buffer.push(value);
                if (value.type === "text-delta" && value.delta && value.delta.trim().length > 0) {
                  hasText = true;
                  for (const b of buffer) controller.enqueue(b);
                  break;
                }
              }

              if (hasText) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
                controller.close();
                return;
              }

              logFailure("empty_text", null);
            } catch (err) {
              const failure = classifyModelError(err);
              logFailure(failure.category, failure.status);
            }
          }

          // If both failed before emitting text, output fallback from mock model
          const fallback = createMockModel({ fallbackNotice: BUSY_NOTICE });
          const fallbackRes = await fallback.doStream(params);
          const fReader = fallbackRes.stream.getReader();
          while (true) {
            const { done, value } = await fReader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      return { stream };
    },
  };
}

let _model: LanguageModelV4 | null = null;

export async function getModel(): Promise<LanguageModelV4> {
  if (_model) return _model;

  if (isMockMode()) {
    _model = createMockModel({
      fallbackNotice: BUSY_NOTICE,
    });
    return _model;
  }

  _model = createFailoverModel();
  return _model;
}

export function wrapWithFallback(baseModel: LanguageModelV4): LanguageModelV4 {
  return wrapLanguageModel({
    model: baseModel,
    middleware: {
      wrapGenerate: async ({ doGenerate, params }) => {
        try {
          const res = await withTimeout(doGenerate(), LIVE_TIMEOUT_MS);
          const textParts = res.content.filter((c) => c.type === "text") as Array<{
            type: "text";
            text: string;
          }>;
          const allText = textParts.map((t) => t.text).join("").trim();
          const hasTool = res.content.some((c) => c.type === "tool-call");
          if (!allText && !hasTool) {
            throw new Error("empty text from the model");
          }
          return res;
        } catch (err) {
          const failure = classifyModelError(err);
          logFailure(failure.category, failure.status);
          const fallback = createMockModel({ fallbackReason: failure.reason });
          return fallback.doGenerate(params);
        }
      },
      wrapStream: async ({ doStream, params }) => {
        try {
          const streamRes = await withTimeout(doStream(), LIVE_TIMEOUT_MS);
          const reader = streamRes.stream.getReader();
          const buffer: LanguageModelV4StreamPart[] = [];
          let hasText = false;
          let hasTool = false;

          const stream = new ReadableStream<LanguageModelV4StreamPart>({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await withTimeout(reader.read(), LIVE_TIMEOUT_MS);
                  if (done) break;
                  buffer.push(value);
                  if (value.type === "tool-call") hasTool = true;
                  if (value.type === "text-delta" && value.delta && value.delta.trim().length > 0) {
                    hasText = true;
                  }
                  if (hasText || hasTool) {
                    for (const b of buffer) controller.enqueue(b);
                    break;
                  }
                }
                if (hasText || hasTool) {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                  }
                  controller.close();
                  return;
                }
                throw new Error("empty text from the model");
              } catch (err) {
                const failure = classifyModelError(err);
                logFailure(failure.category, failure.status);
                const fallback = createMockModel({ fallbackReason: failure.reason });
                const fallbackRes = await fallback.doStream(params);
                const fReader = fallbackRes.stream.getReader();
                while (true) {
                  const { done, value } = await fReader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
                controller.close();
              }
            },
          });
          return { stream };
        } catch (err) {
          const failure = classifyModelError(err);
          logFailure(failure.category, failure.status);
          const fallback = createMockModel({ fallbackReason: failure.reason });
          return fallback.doStream(params);
        }
      },
    },
  });
}

export function resetModel(): void {
  _model = null;
}
