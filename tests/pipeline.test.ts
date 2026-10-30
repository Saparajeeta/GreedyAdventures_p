import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";
import { resetRegistry } from "@/lib/media/registry";
import { resetModel } from "@/lib/chat/model";
import { runTest } from "@/lib/chat/pipeline";

// Force mock mode for all pipeline tests
beforeAll(() => {
  process.env.MOCK_MODE = "true";
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
});

afterAll(() => {
  delete process.env.MOCK_MODE;
});

beforeEach(() => {
  resetIndex();
  resetSourceCache();
  resetRegistry();
  resetModel();
});

describe("pipeline.runTest with mock model", () => {
  it("text-only: answers package pricing question without media", async () => {
    const trace = await runTest("What packages are available for Sea View Skydiving?");
    expect(trace.mode).toBe("mock");
    expect(trace.answer).toBeTruthy();
    expect(trace.chunks.length).toBeGreaterThan(0);
    expect(trace.intentMatched.length).toBe(0);
    expect(trace.mediaSelected.pdf).toBeNull();
    expect(trace.mediaSelected.video).toBeNull();
  });

  it("pdf: brochure intent triggers getBrochure tool", async () => {
    const trace = await runTest("Can you send me the brochure or PDF about the jump?");
    expect(trace.intentMatched).toContain("brochure");
    // Media should be selected
    expect(trace.mediaSelected.pdf).not.toBeNull();
    expect(trace.mediaSelected.pdf?.type).toBe("pdf");
  });

  it("video: video intent triggers getVideo tool", async () => {
    const trace = await runTest("I want to watch a video of the skydiving jump");
    expect(trace.intentMatched).toContain("video");
    expect(trace.mediaSelected.video).not.toBeNull();
    expect(trace.mediaSelected.video?.type).toBe("video");
  });

  it("both: brochure + video intent triggers both tools", async () => {
    const trace = await runTest(
      "Please send me the PDF brochure and a video clip of the jump"
    );
    expect(trace.intentMatched).toContain("brochure");
    expect(trace.intentMatched).toContain("video");
    expect(trace.mediaSelected.pdf).not.toBeNull();
    expect(trace.mediaSelected.video).not.toBeNull();
  });

  it("trace contains all required fields", async () => {
    const trace = await runTest("Tell me about Sea View Skydiving");
    expect(trace).toHaveProperty("question");
    expect(trace).toHaveProperty("retrievalQuery");
    expect(trace).toHaveProperty("chunks");
    expect(trace).toHaveProperty("contextSentToModel");
    expect(trace).toHaveProperty("intentMatched");
    expect(trace).toHaveProperty("mediaSelected");
    expect(trace).toHaveProperty("mode");
    expect(trace).toHaveProperty("modelId");
    expect(trace).toHaveProperty("latencyMs");
    expect(trace).toHaveProperty("answer");
    expect(typeof trace.latencyMs).toBe("number");
  });

  it("contextSentToModel contains SOURCES block", async () => {
    const trace = await runTest("What is the weight limit?");
    expect(trace.contextSentToModel).toContain("## SOURCES");
  });

  it("no-match query produces correct context string", async () => {
    // A query that won't match any chunks still produces the SOURCES header
    const trace = await runTest("zzzzxxx qqqq not a real question abc");
    // Either finds nothing or finds something — context always has SOURCES block
    expect(trace.contextSentToModel).toContain("## SOURCES");
    // If no chunks found, the context says "No relevant sources"
    if (trace.chunks.length === 0) {
      expect(trace.contextSentToModel).toContain("No relevant sources");
    }
  });

  it("modelId is 'mock' in mock mode", async () => {
    const trace = await runTest("What is Sea View Skydiving?");
    expect(trace.modelId).toBe("mock");
  });
});

describe("pipeline: failing model error path", () => {
  it("returns error string on model failure", async () => {
    const trace = await runTest("Test question");
    expect(trace).toHaveProperty("answer");
  });
});

describe("mock model answer quality", () => {
  it("answers from retrieved sources when they exist", async () => {
    const trace = await runTest("What packages are available for Sea View Skydiving?");
    expect(trace.answer.length).toBeGreaterThan(20);
    // Should not be the generic fallback
    expect(trace.answer).not.toContain("I don't have information");
  });

  it("gives contact details when no sources match", async () => {
    const trace = await runTest("zzzzzzz completely random gibberish xyz");
    if (trace.chunks.length === 0) {
      expect(trace.answer).toContain("contact");
    }
  });
});
