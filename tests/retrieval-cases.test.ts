import { describe, it, expect, beforeEach } from "vitest";
import { retrieve, resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";

beforeEach(() => {
  resetIndex();
  resetSourceCache();
});

describe("18 benchmark questions retrieval", () => {
  it("1. package inclusions & prices (ECO, DELUXE, VIP)", () => {
    const chunks = retrieve("What is included in the packages?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined).toMatch(/9,500|ECO/);
    expect(combined).toMatch(/12,500|DELUXE/);
    expect(combined).toMatch(/14,000|VIP/);
  });

  it("2. difference between DELUXE and VIP", () => {
    const chunks = retrieve("What is the difference between DELUXE and VIP?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/deluxe/);
    expect(combined.toLowerCase()).toMatch(/vip/);
  });

  it("3. how much is VIP", () => {
    const chunks = retrieve("VIP package price", 6);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined).toMatch(/14,000/);
  });

  it("4. jump height and freefall time", () => {
    const chunks = retrieve("How high is the jump and how long is the freefall?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined).toMatch(/13,000/);
    expect(combined.toLowerCase()).toMatch(/sixty seconds|60/);
  });

  it("5. time spent at dropzone", () => {
    const chunks = retrieve("How long will I spend at the dropzone?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/3 hours|three to four hours/);
  });

  it("6. GoPro policy", () => {
    const chunks = retrieve("Can I use my own GoPro?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/gopro|camera/);
    expect(combined.toLowerCase()).toMatch(/no/);
  });

  it("7. what to wear", () => {
    const chunks = retrieve("What should I wear?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/trainers/);
    expect(combined.toLowerCase()).toMatch(/comfortable clothes/);
  });

  it("8. Bangkok pickup", () => {
    const chunks = retrieve("Is Bangkok pickup available?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/bangkok pickup/);
  });

  it("9. dropzone location", () => {
    const chunks = retrieve("Where is the dropzone?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/rayong|klaeng|pattaya/);
  });

  it("10. experience requirement", () => {
    const chunks = retrieve("Do I need experience?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/no experience needed|none at all/);
  });

  it("11. bad weather policy", () => {
    const chunks = retrieve("What happens if the weather is bad?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/weather/);
    expect(combined.toLowerCase()).toMatch(/next window|no cost|refund/);
  });

  it("12. cancellation terms", () => {
    const chunks = retrieve("Can I cancel?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/48 hours/);
  });

  it("13. pay in advance", () => {
    const chunks = retrieve("Do I pay in advance?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/pay at the dropzone/);
  });

  it("14. tandem weight limit", () => {
    const chunks = retrieve("What is the weight limit for a tandem jump?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined).toMatch(/100\s*kg/i);
  });

  it("15. parking (not in sources)", () => {
    const chunks = retrieve("Is parking available at the dropzone?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).not.toMatch(/\bparking\b/);
  });

  it("16. Mount Abu jump price", () => {
    const chunks = retrieve("How much is the Mount Abu jump?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined).toMatch(/29,999/);
    expect(combined).toMatch(/39,999/);
  });

  it("17. add video later", () => {
    const chunks = retrieve("Can I add video later?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/add video and photos at the dropzone/);
  });

  it("18. offered adventures", () => {
    const chunks = retrieve("What adventures do you offer?", 4);
    const combined = chunks.map((c) => c.text).join(" ");
    expect(combined.toLowerCase()).toMatch(/skydiving/);
    expect(combined.toLowerCase()).toMatch(/paragliding/);
  });
});
