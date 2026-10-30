import { describe, it, expect, beforeEach } from "vitest";
import { retrieve, resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";

beforeEach(() => {
  resetIndex();
  resetSourceCache();
});

describe("retrieve (BM25)", () => {
  it("returns top results for a known question", () => {
    const results = retrieve("What are the package prices for Sea View Skydiving?", 4);
    expect(results.length).toBeGreaterThan(0);
    // Should find sea-view-skydiving content
    const hasSeaView = results.some((r) =>
      r.sourceId.includes("sea-view") || r.sourceTitle.toLowerCase().includes("sea view")
    );
    expect(hasSeaView).toBe(true);
  });

  it("returns results for weight limit question retrieving contact.md chunk", () => {
    const results = retrieve("What is the weight limit for a tandem jump?", 4);
    expect(results.length).toBeGreaterThan(0);
    const contactChunk = results.find(
      (r) => r.sourceUrl.includes("/contact") || r.sourceId.includes("contact")
    );
    expect(contactChunk).toBeDefined();
    expect(contactChunk?.text.toLowerCase()).toContain("100 kg");
  });

  it("returns results for contact info", () => {
    const results = retrieve("How can I contact Greedy Adventures?", 4);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns results for cancellation policy", () => {
    const results = retrieve("What is the cancellation policy?", 4);
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
    const results = retrieve("skydiving packages ECO DELUXE VIP price", 4);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it("follow-up short query uses combined context", () => {
    // Simulate: previous message was about packages, follow-up is "how much?"
    // retrieve combines prev + last for short queries (< 6 words)
    const combined = "What are the packages? How much?";
    const results = retrieve(combined, 4);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for unrecognizable query with no tokens", () => {
    const results = retrieve("", 4);
    expect(results).toEqual([]);
  });

  it("returns results with required fields", () => {
    const results = retrieve("skydiving thailand", 4);
    for (const r of results) {
      expect(r).toHaveProperty("sourceId");
      expect(r).toHaveProperty("sourceTitle");
      expect(r).toHaveProperty("sourceUrl");
      expect(r).toHaveProperty("heading");
      expect(r).toHaveProperty("text");
      expect(r).toHaveProperty("score");
    }
  });
});
