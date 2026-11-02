import { describe, it, expect, beforeEach } from "vitest";
import {
  classifyModelError,
  FAILURE_REASONS,
  UNRELATED_REDIRECT_MESSAGE,
} from "@/lib/chat/failure";
import { wrapWithFallback, resetModel } from "@/lib/chat/model";
import { MockLanguageModelV4 } from "ai/test";
import { generateText, stepCountIs } from "ai";
import { z } from "zod";

describe("failure classification & reasons", () => {
  it("maps 400 and 401 to invalid key reason", () => {
    const err400 = Object.assign(new Error("API key invalid"), { status: 400 });
    const err401 = Object.assign(new Error("Unauthorized"), { statusCode: 401 });
    expect(classifyModelError(err400).reason).toBe(FAILURE_REASONS.invalid_key);
    expect(classifyModelError(err401).reason).toBe(FAILURE_REASONS.invalid_key);
  });

  it("maps 403 to blocked project reason", () => {
    const err403 = Object.assign(new Error("Forbidden"), { status: 403 });
    expect(classifyModelError(err403).reason).toBe(FAILURE_REASONS.blocked);
  });

  it("maps 404 to model not found reason", () => {
    const err404 = Object.assign(new Error("Model not found"), { status: 404 });
    expect(classifyModelError(err404).reason).toBe(FAILURE_REASONS.model_not_found);
  });

  it("maps 429 to rate limit quota reason", () => {
    const err429 = Object.assign(new Error("Resource exhausted"), { status: 429 });
    expect(classifyModelError(err429).reason).toBe(FAILURE_REASONS.rate_limit);
  });

  it("maps timeout and network errors to timeout reason", () => {
    const errTimeout = Object.assign(new Error("The request timed out"), { code: "ETIMEDOUT" });
    const errNetwork = Object.assign(new Error("fetch failed"), {});
    expect(classifyModelError(errTimeout).reason).toBe(FAILURE_REASONS.timeout);
    expect(classifyModelError(errNetwork).reason).toBe(FAILURE_REASONS.timeout);
  });

  it("maps empty text to empty-text reason", () => {
    const errEmpty = new Error("empty text from the model");
    expect(classifyModelError(errEmpty).reason).toBe(FAILURE_REASONS.empty_text);
  });

  it("maps unexpected errors to unexpected reason", () => {
    const errOther = new Error("Internal server fault");
    expect(classifyModelError(errOther).reason).toBe(FAILURE_REASONS.unexpected);
  });

  it("maps mock_demo category to demo answer reason", () => {
    const errDemo = { category: "mock_demo" as const };
    expect(classifyModelError(errDemo).reason).toBe(FAILURE_REASONS.mock_demo);
  });
});

describe("wrapped fallback model behavior", () => {
  beforeEach(() => {
    resetModel();
  });

  it("a failing live model gives the fallback line plus the sources", async () => {
    const failingModel = new MockLanguageModelV4({
      provider: "mock-failing",
      modelId: "failing-gemini",
      doGenerate: async () => {
        const err = Object.assign(new Error("Quota limit reached"), { status: 429 });
        throw err;
      },
    });

    const wrapped = wrapWithFallback(failingModel);
    const system = `You are an assistant. ## SOURCES\n• ECO (฿9,500): Jump only.\n• DELUXE (฿12,500): Photos included.`;
    const result = await generateText({
      model: wrapped,
      system,
      prompt: "What is included in the package?",
    });

    expect(result.text).toContain("Fallback answer (The AI service's free usage limit was reached for now.). Here is the closest text from the Greedy Adventures website:");
    expect(result.text).toMatch(/ECO.*9,500/);
  });

  it("a brochure request under failure still returns the PDF card", async () => {
    const failingModel = new MockLanguageModelV4({
      provider: "mock-failing",
      modelId: "failing-gemini",
      doGenerate: async () => {
        const err = Object.assign(new Error("Bad API key"), { status: 400 });
        throw err;
      },
    });

    const wrapped = wrapWithFallback(failingModel);
    const result = await generateText({
      model: wrapped,
      prompt: "Can you send me a brochure?",
      stopWhen: stepCountIs(5),
      tools: {
        getBrochure: {
          description: "Get brochure",
          inputSchema: z.object({}),
          execute: async () => ({
            available: true,
            item: { type: "pdf", title: "Brochure", url: "/media/sea-view-skydiving-brochure.pdf" },
          }),
        },
      },
    });

    // Step 1 tool call should be made
    const toolCall = result.toolCalls.find((t) => t.toolName === "getBrochure");
    expect(toolCall).toBeDefined();
    expect(result.text).toContain("Fallback answer (The AI service did not accept this site's access key.). Here is the closest text from the Greedy Adventures website:");
    expect(result.text).toContain("Here is the brochure.");
  });

  it("empty model text triggers the empty-text reason", async () => {
    const emptyModel = new MockLanguageModelV4({
      provider: "mock-empty",
      modelId: "empty-gemini",
      doGenerate: async () => ({
        content: [{ type: "text" as const, text: "   " }],
        finishReason: { unified: "stop" as const, raw: "stop" },
        usage: {
          inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 0, text: 0, reasoning: 0 },
        },
        warnings: [],
      }),
    });

    const wrapped = wrapWithFallback(emptyModel);
    const result = await generateText({
      model: wrapped,
      prompt: "How much is VIP?",
    });

    expect(result.text).toContain("Fallback answer (The AI service returned no text for this question.). Here is the closest text from the Greedy Adventures website:");
    expect(result.text).toMatch(/VIP.*14,000/);
  });

  it("an unrelated question does not trigger the fallback", async () => {
    const failingModel = new MockLanguageModelV4({
      provider: "mock-failing",
      modelId: "failing-gemini",
      doGenerate: async () => {
        const err = Object.assign(new Error("Quota limit reached"), { status: 429 });
        throw err;
      },
    });

    const wrapped = wrapWithFallback(failingModel);
    const result = await generateText({
      model: wrapped,
      prompt: "Write me a python script",
    });

    expect(result.text).toBe(UNRELATED_REDIRECT_MESSAGE);
    expect(result.text).not.toContain("Fallback answer");
  });
});

