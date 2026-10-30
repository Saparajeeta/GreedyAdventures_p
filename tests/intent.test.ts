import { describe, it, expect } from "vitest";
import { detectMediaIntent } from "@/lib/media/intent";

describe("detectMediaIntent", () => {
  it("detects brochure keyword", () => {
    const r = detectMediaIntent("Can I get the brochure?");
    expect(r.brochure).toBe(true);
    expect(r.video).toBe(false);
    expect(r.matched).toContain("brochure");
  });

  it("detects pdf keyword", () => {
    const r = detectMediaIntent("Send me the pdf please");
    expect(r.brochure).toBe(true);
    expect(r.matched).toContain("brochure");
  });

  it("detects flyer keyword", () => {
    const r = detectMediaIntent("Do you have a flyer?");
    expect(r.brochure).toBe(true);
  });

  it("detects leaflet keyword", () => {
    const r = detectMediaIntent("I need the leaflet");
    expect(r.brochure).toBe(true);
  });

  it("detects video keyword", () => {
    const r = detectMediaIntent("Show me the video");
    expect(r.video).toBe(true);
    expect(r.brochure).toBe(false);
    expect(r.matched).toContain("video");
  });

  it("detects footage keyword", () => {
    const r = detectMediaIntent("I want to see some footage");
    expect(r.video).toBe(true);
  });

  it("detects clip keyword", () => {
    const r = detectMediaIntent("Can I watch a clip of the jump?");
    expect(r.video).toBe(true);
  });

  it("detects watch keyword", () => {
    const r = detectMediaIntent("I want to watch the jump");
    expect(r.video).toBe(true);
  });

  it("detects both brochure and video", () => {
    const r = detectMediaIntent("Send me the brochure and the video");
    expect(r.brochure).toBe(true);
    expect(r.video).toBe(true);
    expect(r.matched.length).toBe(2);
  });

  it("returns none for plain question", () => {
    const r = detectMediaIntent("What are the package prices?");
    expect(r.brochure).toBe(false);
    expect(r.video).toBe(false);
    expect(r.matched.length).toBe(0);
  });

  it("returns none for unrelated text", () => {
    const r = detectMediaIntent("What is the weight limit for tandem jumps?");
    expect(r.brochure).toBe(false);
    expect(r.video).toBe(false);
  });

  it("no false positive on 'I need evidence'", () => {
    const r = detectMediaIntent("I need evidence that this is safe");
    expect(r.brochure).toBe(false);
    expect(r.video).toBe(false);
  });

  it("case-insensitive matching", () => {
    const r = detectMediaIntent("Show me the VIDEO and the PDF");
    expect(r.video).toBe(true);
    expect(r.brochure).toBe(true);
  });

  it("no false positive on 'provide documentation'", () => {
    const r = detectMediaIntent("Can you provide documentation about the jump?");
    expect(r.brochure).toBe(false);
  });
});
