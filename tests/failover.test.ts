import { describe, it, expect, beforeEach } from "vitest";
import { createFailoverModel, resetModel, getProviderCandidates } from "@/lib/chat/model";

describe("provider candidates", () => {
  beforeEach(() => {
    resetModel();
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_PRIMARY;
  });

  it("returns empty when no keys set", () => {
    expect(getProviderCandidates()).toEqual([]);
  });

  it("returns google first when google key set and primary is google", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    process.env.LLM_PRIMARY = "google";
    expect(getProviderCandidates()).toEqual(["google"]);
  });

  it("returns groq first when primary is groq and groq key set", () => {
    process.env.GROQ_API_KEY = "test-key";
    process.env.LLM_PRIMARY = "groq";
    expect(getProviderCandidates()).toEqual(["groq"]);
  });

  it("returns both when both keys set", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    process.env.GROQ_API_KEY = "test-key";
    process.env.LLM_PRIMARY = "google";
    const c = getProviderCandidates();
    expect(c).toContain("google");
    expect(c).toContain("groq");
    expect(c[0]).toBe("google");
  });
});

describe("failover model with no keys", () => {
  beforeEach(() => {
    resetModel();
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.LLM_PRIMARY;
    process.env.MOCK_MODE = "false";
  });

  it("doGenerate falls back to mock when no providers available", async () => {
    const model = createFailoverModel();
    const result = await model.doGenerate({
      inputFormat: "prompt",
      mode: { type: "regular" },
      prompt: [
        {
          role: "system",
          content: "You are an assistant. ## SOURCES\n• ECO: The jump.",
        },
        {
          role: "user",
          content: [{ type: "text", text: "What packages?" }],
        },
      ],
    });
    const text = result.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("");
    expect(text.length).toBeGreaterThan(0);
    // Should contain the busy notice
    expect(text).toContain("AI service is busy");
  });
});
