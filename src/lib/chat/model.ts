import { createMockModel } from "./mock-model";
import type { LanguageModelV4 } from "@ai-sdk/provider";

const DEFAULT_MODEL = "gemini-3.8-flash";

// Lazy import to avoid loading @ai-sdk/google when not needed
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
  return process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

let _model: LanguageModelV4 | null = null;

export async function getModel(): Promise<LanguageModelV4> {
  if (_model) return _model;

  if (isMockMode()) {
    _model = createMockModel();
    return _model;
  }

  const modelId = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  _model = await getGoogleModel(modelId);
  return _model;
}

// Reset the cached model instance (used by tests when switching modes).
export function resetModel(): void {
  _model = null;
}
