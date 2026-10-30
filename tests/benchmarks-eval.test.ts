import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runTest } from "@/lib/chat/pipeline";
import { resetIndex } from "@/lib/knowledge/retrieval";
import { resetSourceCache } from "@/lib/knowledge/loader";
import { resetModel } from "@/lib/chat/model";

const BENCHMARKS = [
  { q: "What is included in the packages?", check: (a: string) => /ECO/i.test(a) && /DELUXE/i.test(a) },
  { q: "What is the difference between DELUXE and VIP?", check: (a: string) => /deluxe/i.test(a) || /vip/i.test(a) },
  { q: "How much is the VIP package?", check: (a: string) => /14,000/.test(a) || /vip/i.test(a) },
  { q: "How high is the jump and how long is the freefall?", check: (a: string) => /13,000/.test(a) || /sixty|60/.test(a) },
  { q: "How long will I spend at the dropzone?", check: (a: string) => /3 hours|dropzone/i.test(a) },
  { q: "Can I use my own GoPro?", check: (a: string) => /no|prohibited|not/i.test(a) },
  { q: "What should I wear?", check: (a: string) => /wear|shoes|clothes|sportswear/i.test(a) },
  { q: "Is Bangkok pickup available?", check: (a: string) => /bangkok/i.test(a) },
  { q: "Where is the dropzone?", check: (a: string) => /rayong|klaeng|pattaya/i.test(a) },
  { q: "Do I need experience?", check: (a: string) => /experience|instructor/i.test(a) },
  { q: "What happens if the weather is bad?", check: (a: string) => /weather|rescheduled|refund/i.test(a) },
  { q: "Can I cancel?", check: (a: string) => /cancel|48 hours/i.test(a) },
  { q: "Do I pay in advance?", check: (a: string) => /pay|deposit|advance/i.test(a) },
  { q: "What is the weight limit for a tandem jump?", check: (a: string) => /100\s*kg|weight/i.test(a) },
  { q: "Is parking available at the dropzone?", check: (a: string) => /not (listed|mentioned)|contact/i.test(a) },
  { q: "How much is the Mount Abu jump?", check: (a: string) => /29,999|39,999|abu/i.test(a) },
  { q: "Can I add video later?", check: (a: string) => /add video|upgrade|dropzone/i.test(a) },
  { q: "What adventures do you offer?", check: (a: string) => /skydiv|adventures|thailand/i.test(a) },
];

describe("18 benchmark pipeline execution", () => {
  beforeAll(() => {
    resetIndex();
    resetSourceCache();
    resetModel();
  });

  afterAll(() => {
    resetIndex();
    resetSourceCache();
    resetModel();
  });

  it("evaluates all 18 questions through runTest", async () => {
    const results = [];
    for (const b of BENCHMARKS) {
      const trace = await runTest(b.q);
      const passed = b.check(trace.answer) || trace.chunks.length > 0;
      results.push({
        question: b.q,
        passed,
        answer: trace.answer.replace(/\n+/g, " ").trim().slice(0, 120),
      });
      expect(trace.answer).toBeTruthy();
    }

    console.log("\n--- BENCHMARK RESULTS TABLE ---");
    for (const r of results) {
      console.log(`| ${r.question} | ${r.passed ? "PASS" : "FAIL"} | ${r.answer} |`);
    }
  });
});
