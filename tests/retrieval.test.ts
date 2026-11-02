import { describe, it, expect, beforeEach } from "vitest";
import { retrieve, resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";
import { chunkAllSources } from "@/lib/knowledge/chunker";
import { loadSources } from "@/lib/knowledge/loader";

beforeEach(() => {
  resetIndex();
  resetSourceCache();
});

describe("retrieve (BM25)", () => {
  it("returns top results for a known question", () => {
    const results = retrieve("What are the package prices for Sea View Skydiving?");
    expect(results.length).toBeGreaterThan(0);
    // Should find sea-view-skydiving content
    const hasSeaView = results.some((r) =>
      r.sourceId.includes("sea-view") || r.sourceTitle.toLowerCase().includes("sea view")
    );
    expect(hasSeaView).toBe(true);
  });

  it("returns results for weight limit question retrieving contact.md chunk", () => {
    const results = retrieve("What is the weight limit for a tandem jump?");
    expect(results.length).toBeGreaterThan(0);
    const contactChunk = results.find(
      (r) => r.sourceUrl.includes("/contact") || r.sourceId.includes("contact")
    );
    expect(contactChunk).toBeDefined();
    expect(contactChunk?.text.toLowerCase()).toContain("100 kg");
  });

  it("returns results for contact info", () => {
    const results = retrieve("How can I contact Greedy Adventures?");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns results for cancellation policy", () => {
    const results = retrieve("What is the cancellation policy?");
    expect(results.length).toBeGreaterThan(0);
    const hasCancellation = results.some(
      (r) =>
        r.sourceId.includes("cancel") ||
        r.text.toLowerCase().includes("cancel") ||
        r.sourceTitle.toLowerCase().includes("cancel")
    );
    expect(hasCancellation).toBe(true);
  });

  it("scores are descending", () => {
    const results = retrieve("skydiving packages ECO DELUXE VIP price");
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it("follow-up short query uses combined context", () => {
    // Simulate: previous message was about packages, follow-up is "how much?"
    // retrieve combines prev + last for short queries (< 6 words)
    const combined = "What are the packages? How much?";
    const results = retrieve(combined);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for unrecognizable query with no tokens", () => {
    const results = retrieve("");
    expect(results).toEqual([]);
  });

  it("returns results with required fields", () => {
    const results = retrieve("skydiving thailand");
    for (const r of results) {
      expect(r).toHaveProperty("sourceId");
      expect(r).toHaveProperty("sourceTitle");
      expect(r).toHaveProperty("sourceUrl");
      expect(r).toHaveProperty("location");
      expect(r).toHaveProperty("heading");
      expect(r).toHaveProperty("text");
      expect(r).toHaveProperty("score");
    }
  });

  it("expands price questions to retrieve the package pricing chunk", () => {
    const results = retrieve("How much is VIP?");
    expect(results[0].sourceId).toBe("sea-view-skydiving");
    expect(results.some((result) => result.text.includes("฿14,000"))).toBe(true);
  });

  it.each([
    ["child age", "How old can children be?", "contact", "18 or older"],
    ["video photos", "Can I bring my camera for photos?", "pattaya-escape", "video and photos"],
    ["weather", "What happens in high winds?", "contact", "wind and cloud"],
    ["cancellation", "Can I reschedule?", "cancellations", "48 hours"],
    ["what to wear", "Which shoes should I wear?", "pattaya-escape", "Trainers"],
    ["pickup", "Can I arrange transport from Bangkok?", "sea-view-skydiving", "Bangkok pickup"],
    ["safety instructors", "What risks and safety rules apply?", "sea-view-skydiving", "Safety briefing"],
  ])("expands query for %s", (_name, query, sourceId, text) => {
    const results = retrieve(query);
    expect(results.some((result) => result.sourceId === sourceId && result.text.includes(text))).toBe(true);
  });

  it("returns all Pattaya Sea View and contact chunks for a weak match", () => {
    const results = retrieve("what is it?");
    const expected = chunkAllSources(loadSources()).filter((chunk) =>
      ["sea-view-skydiving", "contact"].includes(chunk.sourceId)
    );
    const fallback = results.filter((result) =>
      ["sea-view-skydiving", "contact"].includes(result.sourceId)
    );
    expect(fallback).toHaveLength(expected.length);
    expect(fallback.every((result) => result.score === 0)).toBe(true);
  });

  it("does not include Pattaya fallback chunks for Mount Abu questions", () => {
    const results = retrieve("Unclear India Mount Abu question");
    expect(results.every((result) => result.location !== "Pattaya")).toBe(true);
  });
});
