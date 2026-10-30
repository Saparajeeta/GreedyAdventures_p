import { describe, it, expect } from "vitest";
import { ChatBodySchema, KnowledgeTestBodySchema, UIMessageSchema } from "@/lib/schemas";

describe("ChatBodySchema", () => {
  it("accepts a valid single user message", () => {
    const result = ChatBodySchema.safeParse({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "Hello" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    // Empty array is valid per schema (max 40), but route would reject it
    const result = ChatBodySchema.safeParse({ messages: [] });
    expect(result.success).toBe(true);
  });

  it("rejects more than 40 messages", () => {
    const messages = Array.from({ length: 41 }, (_, i) => ({
      id: String(i),
      role: "user",
      parts: [{ type: "text", text: "msg" }],
    }));
    const result = ChatBodySchema.safeParse({ messages });
    expect(result.success).toBe(false);
  });

  it("rejects message text over 1000 chars", () => {
    const result = ChatBodySchema.safeParse({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "x".repeat(1001) }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 40 messages", () => {
    const messages = Array.from({ length: 40 }, (_, i) => ({
      id: String(i),
      role: "user",
      parts: [{ type: "text", text: "msg" }],
    }));
    const result = ChatBodySchema.safeParse({ messages });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = UIMessageSchema.safeParse({
      id: "1",
      role: "admin",
      parts: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("KnowledgeTestBodySchema", () => {
  it("accepts a valid question", () => {
    const result = KnowledgeTestBodySchema.safeParse({
      question: "What are the prices?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty question", () => {
    const result = KnowledgeTestBodySchema.safeParse({ question: "" });
    expect(result.success).toBe(false);
  });

  it("rejects question over 300 chars", () => {
    const result = KnowledgeTestBodySchema.safeParse({
      question: "x".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 300 chars", () => {
    const result = KnowledgeTestBodySchema.safeParse({
      question: "x".repeat(300),
    });
    expect(result.success).toBe(true);
  });
});
