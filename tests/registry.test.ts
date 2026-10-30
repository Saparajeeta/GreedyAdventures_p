import { describe, it, expect, beforeEach } from "vitest";
import { selectMedia, isAllowedUrl, resetRegistry } from "@/lib/media/registry";

beforeEach(() => {
  resetRegistry();
});

describe("selectMedia", () => {
  it("returns a PDF item", () => {
    const item = selectMedia("pdf");
    expect(item).not.toBeNull();
    expect(item?.type).toBe("pdf");
  });

  it("returns a video item", () => {
    const item = selectMedia("video");
    expect(item).not.toBeNull();
    expect(item?.type).toBe("video");
  });
});

describe("isAllowedUrl", () => {
  it("allows own /media/ paths", () => {
    expect(isAllowedUrl("/media/sea-view-skydiving-brochure.pdf")).toBe(true);
  });

  it("allows greedyadventures.com (from media.json)", () => {
    resetRegistry();
    selectMedia("pdf"); // triggers registry load
    expect(
      isAllowedUrl(
        "https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4"
      )
    ).toBe(true);
  });

  it("rejects non-allowlisted URL", () => {
    resetRegistry();
    selectMedia("pdf");
    expect(isAllowedUrl("https://malicious.example.com/file.pdf")).toBe(false);
  });

  it("rejects arbitrary https URLs", () => {
    resetRegistry();
    selectMedia("pdf");
    expect(isAllowedUrl("https://evil.com/hack.pdf")).toBe(false);
  });
});
