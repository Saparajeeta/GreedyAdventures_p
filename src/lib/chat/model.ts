import { createMockModel } from "./mock-model";
import type { LanguageModelV4 } from "@ai-sdk/provider";

// Lazy import to avoid loading @ai-sdk/google when not needed
let _google: ((modelId: string) => LanguageModelV4) | null = null;

async function getGoogleModel(modelId: string): Promise<LanguageModelV4> {
  if (!_google) {
    const { google } = await import("@ai-sdk/google");
    _google = google;
  }
  return _google(modelId);
}

let _model: LanguageModelV4 | null = null;

export async function getModel(): Promise<LanguageModelV4> {
  if (_model) return _model;

  const mockMode =
    process.env.MOCK_MODE === "true" || !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (mockMode) {
    _model = createMockModel();
    return _model;
  }

  const modelId = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  _model = await getGoogleModel(modelId);
  return _model;
}

export function getModelId(): string {
  const mockMode =
    process.env.MOCK_MODE === "true" || !process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (mockMode) return "mock";
  return process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
}

export function isMockMode(): boolean {
  return (
    process.env.MOCK_MODE === "true" || !process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}
