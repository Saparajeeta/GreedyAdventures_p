import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { runTest } from "@/lib/chat/pipeline";
import { resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";
import { resetModel } from "@/lib/chat/model";

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
  resetModel();
});

describe("off-topic and greeting replies", () => {
  it("off-topic question gets polite redirect", async () => {
    const trace = await runTest("Write me a python script");
    const lower = trace.answer.toLowerCase();
    expect(lower).toContain("outside");
    expect(lower).not.toContain("def ");
    expect(lower).not.toContain("print(");
  });

  it("greeting gets a natural reply", async () => {
    const trace = await runTest("Hi there!");
    const lower = trace.answer.toLowerCase();
    expect(lower).toMatch(/hello|hi|hey|help/);
  });

  it("domain question gets a factual answer", async () => {
    const trace = await runTest("How much is VIP?");
    expect(trace.answer).toContain("14,000");
  });
});
