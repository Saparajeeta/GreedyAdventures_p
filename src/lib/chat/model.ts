import { wrapLanguageModel } from "ai";
import { createMockModel } from "./mock-model";
import {
  classifyModelError,
  logFailure,
  FAILURE_REASONS,
  type FailureCategory,
} from "./failure";
import type {
  LanguageModelV4,
  LanguageModelV4StreamPart,
} from "@ai-sdk/provider";
// LanguageModelV4StreamPart is used in wrapStreamForErrors return type and ReadableStream generics

const DEFAULT_MODEL = "gemini-3.8-flash";

let _google: ((modelId: string) => LanguageModelV4) | null = null;

async function getGoogleModel(modelId: string): Promise<LanguageModelV4> {
  if (!_google) {
    const { google } = await import("@ai-sdk/google");
    _google = google;
  }
  return _google(modelId);
}

function parseMockMode(): boolean {
  const raw = (process.env.MOCK_MODE ?? "").replace(/['" ]/g, "").toLowerCase();
  return raw === "true";
}

export function isMockMode(): boolean {
  if (parseMockMode()) return true;
  return !process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

export function getModelId(): string {
  if (isMockMode()) return "mock";
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

let _model: LanguageModelV4 | null = null;

export async function getModel(): Promise<LanguageModelV4> {
  if (_model) return _model;

  if (isMockMode()) {
    _model = createMockModel({
      fallbackReason: FAILURE_REASONS.mock_demo,
    });
    return _model;
  }

  const modelId = getModelId();
  const baseModel = await getGoogleModel(modelId);
  _model = wrapWithFallback(baseModel);
  return _model;
}

export function wrapWithFallback(baseModel: LanguageModelV4): LanguageModelV4 {
  return wrapLanguageModel({
    model: baseModel,
    middleware: {
      wrapGenerate: async ({ doGenerate, params }) => {
        try {
          const res = await doGenerate();
          const textParts = res.content.filter((c) => c.type === "text") as Array<{
            type: "text";
            text: string;
          }>;
          const allText = textParts.map((t) => t.text).join("").trim();
          const hasTool = res.content.some((c) => c.type === "tool-call");
          if (!allText && !hasTool) {
            const err = new Error("empty text from the model");
            (err as { category?: FailureCategory }).category = "empty_text";
            throw err;
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
          const res = await doStream();
          return wrapStreamForErrors(res, params);
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

function wrapStreamForErrors(
  streamResult: { stream: ReadableStream<LanguageModelV4StreamPart>; warnings?: unknown[] },
  params: Parameters<LanguageModelV4["doStream"]>[0]
): { stream: ReadableStream<LanguageModelV4StreamPart>; warnings?: unknown[] } {
  let emittedAny = false;
  const reader = streamResult.stream.getReader();

  const stream = new ReadableStream<LanguageModelV4StreamPart>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === "text-delta" || value.type === "tool-call") {
            emittedAny = true;
          }
          controller.enqueue(value);
        }

        if (!emittedAny) {
          const failure = classifyModelError(new Error("empty text from the model"));
          logFailure(failure.category, failure.status);
          const fallback = createMockModel({ fallbackReason: failure.reason });
          const fallbackRes = await fallback.doStream(params);
          const fReader = fallbackRes.stream.getReader();
          while (true) {
            const { done, value } = await fReader.read();
            if (done) break;
            controller.enqueue(value);
          }
        }

        controller.close();
      } catch (err) {
        if (!emittedAny) {
          const failure = classifyModelError(err);
          logFailure(failure.category, failure.status);
          try {
            const fallback = createMockModel({ fallbackReason: failure.reason });
            const fallbackRes = await fallback.doStream(params);
            const fReader = fallbackRes.stream.getReader();
            while (true) {
              const { done, value } = await fReader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.close();
            return;
          } catch (fbErr) {
            controller.error(fbErr);
            return;
          }
        }
        controller.error(err);
      }
    },
  });

  return { stream, warnings: streamResult.warnings };
}

export function resetModel(): void {
  _model = null;
}
