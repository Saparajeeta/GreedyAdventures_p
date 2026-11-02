import { describe, it, expect } from "vitest";
import { isMediaOnlyRequest, detectMediaIntent } from "@/lib/media/intent";

describe("isMediaOnlyRequest", () => {
  it("pure brochure request is media-only", () => {
    expect(isMediaOnlyRequest("Send me the brochure")).toBe(true);
    expect(isMediaOnlyRequest("Can I get a PDF?")).toBe(true);
    expect(isMediaOnlyRequest("please share the flyer")).toBe(true);
  });

  it("pure video request is media-only", () => {
    expect(isMediaOnlyRequest("Show me a video")).toBe(true);
    expect(isMediaOnlyRequest("Can I watch the footage?")).toBe(true);
  });

  it("both media types is media-only", () => {
    expect(isMediaOnlyRequest("Send me the brochure and a video")).toBe(true);
  });

  it("media request with extra question is not media-only", () => {
    expect(isMediaOnlyRequest("Send me a brochure and what is the price?")).toBe(false);
    expect(isMediaOnlyRequest("Video please, also how high is the jump?")).toBe(false);
  });

  it("plain question is not media-only", () => {
    expect(isMediaOnlyRequest("What packages are available?")).toBe(false);
    expect(isMediaOnlyRequest("How much is VIP?")).toBe(false);
  });

  it("no text is not media-only", () => {
    expect(isMediaOnlyRequest("")).toBe(false);
  });
});

describe("detectMediaIntent edge cases", () => {
  it("film triggers video intent", () => {
    const r = detectMediaIntent("show me the film");
    expect(r.video).toBe(true);
  });

  it("leaflet triggers brochure intent", () => {
    const r = detectMediaIntent("have you got a leaflet?");
    expect(r.brochure).toBe(true);
  });

  it("no false positive on package question", () => {
    const r = detectMediaIntent("What is included in the VIP package?");
    expect(r.brochure).toBe(false);
    expect(r.video).toBe(false);
  });
});
