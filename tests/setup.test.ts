import { describe, it, expect } from "vitest";
import { MediaRegistrySchema } from "@/lib/schemas";
import * as fs from "fs";
import * as path from "path";

describe("Phase 1b: Data Sources & Media Registry", () => {
  it("validates all 7 source snapshot markdown files have required frontmatter", () => {
    const sourcesDir = path.join(process.cwd(), "data", "sources");
    const files = fs.readdirSync(sourcesDir).filter((f) => f.endsWith(".md"));
    expect(files.length).toBe(7);

    for (const file of files) {
      const raw = fs.readFileSync(path.join(sourcesDir, file), "utf-8");
      expect(raw.startsWith("---")).toBe(true);

      const endFm = raw.indexOf("---", 3);
      expect(endFm).toBeGreaterThan(3);

      const frontmatter = raw.slice(3, endFm);
      expect(frontmatter).toContain("title:");
      expect(frontmatter).toContain("url:");
      expect(frontmatter).toContain("capturedAt:");

      const body = raw.slice(endFm + 3).trim();
      expect(body.length).toBeGreaterThan(100);
    }
  });

  it("verifies sea-view-skydiving snapshot contains exact real packages and plan steps without invented stats", () => {
    const seaViewPath = path.join(process.cwd(), "data", "sources", "sea-view-skydiving.md");
    const content = fs.readFileSync(seaViewPath, "utf-8");

    // Real prices
    expect(content).toContain("฿9,500");
    expect(content).toContain("฿12,500");
    expect(content).toContain("฿14,000");

    // Packages
    expect(content).toContain("ECO");
    expect(content).toContain("DELUXE");
    expect(content).toContain("VIP");

    // 5-step plan
    expect(content).toContain("Arrival and check-in");
    expect(content).toContain("Safety briefing and gear fitting");
    expect(content).toContain("Boarding and the climb");
    expect(content).toContain("Exit and freefall");
    expect(content).toContain("Canopy flight and landing");

    // Address
    expect(content).toContain("95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand");
  });

  it("validates media registry against MediaRegistrySchema with real video and demo PDF", () => {
    const mediaPath = path.join(process.cwd(), "data", "media.json");
    const raw = fs.readFileSync(mediaPath, "utf-8");
    const data = JSON.parse(raw);
    const parsed = MediaRegistrySchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const video = parsed.data.items.find((i) => i.type === "video");
      const pdf = parsed.data.items.find((i) => i.type === "pdf");

      expect(video).toBeDefined();
      expect(video?.isDemo).toBe(false);
      expect(video?.url).toBe("https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4");

      expect(pdf).toBeDefined();
      expect(pdf?.isDemo).toBe(true);
      expect(pdf?.title).toContain("Demo material");
    }
  });

  it("ensures generated demo brochure PDF exists in public/media", () => {
    const pdfPath = path.join(process.cwd(), "public", "media", "sea-view-skydiving-brochure.pdf");
    expect(fs.existsSync(pdfPath)).toBe(true);
  });
});
