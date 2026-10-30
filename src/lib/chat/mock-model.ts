import { MockLanguageModelV4 } from "ai/test";
import type {
  LanguageModelV4,
  LanguageModelV4Content,
  LanguageModelV4StreamPart,
} from "@ai-sdk/provider";

/**
 * Deterministic mock language model.
 * - Extracts SOURCES block from system prompt and produces a grounded answer.
 * - If tool names are present in the prompt options, calls the appropriate tool.
 * - Uses MockLanguageModelV4 from ai/test.
 */
export function createMockModel(): LanguageModelV4 {
  const mock: LanguageModelV4 = new MockLanguageModelV4({
    provider: "mock",
    modelId: "mock-model",
    doGenerate: async (options) => {
      const tools = options.tools ?? [];
      const toolNames = tools.map((t) => t.name);

      // Extract last user message text
      const messages = options.prompt;
      let lastUserText = "";
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role === "user") {
          const textPart = msg.content.find((c) => c.type === "text");
          if (textPart && textPart.type === "text") {
            lastUserText = textPart.text;
          }
          break;
        }
      }

      // Extract SOURCES block from system prompt
      let sourcesText = "";
      const systemMsg = messages.find((m) => m.role === "system");
      if (systemMsg) {
        const sysContent = Array.isArray(systemMsg.content)
          ? systemMsg.content
              .filter((c) => c.type === "text")
              .map((c) => (c as { type: "text"; text: string }).text)
              .join("")
          : "";
        const sourcesMatch = sysContent.match(/## SOURCES\n([\s\S]*?)(?:##|$)/);
        if (sourcesMatch) sourcesText = sourcesMatch[1].trim();
      }

      const lowerQuery = lastUserText.toLowerCase();

      // Decide which tools to call
      const wantsBrochure =
        toolNames.includes("getBrochure") &&
        /brochure|pdf|flyer|leaflet/.test(lowerQuery);
      const wantsVideo =
        toolNames.includes("getVideo") &&
        /video|footage|clip|watch/.test(lowerQuery);

      const content: LanguageModelV4Content[] = [];

      if (wantsBrochure) {
        content.push({
          type: "tool-call",
          toolCallId: "mock-brochure-call",
          toolName: "getBrochure",
          input: "{}",
        });
      }
      if (wantsVideo) {
        content.push({
          type: "tool-call",
          toolCallId: "mock-video-call",
          toolName: "getVideo",
          input: "{}",
        });
      }

      // Generate answer from sources
      let answer = "";
      if (wantsBrochure || wantsVideo) {
        answer = "Here is the requested media for Sea View Skydiving.";
      } else if (sourcesText) {
        // Extract first relevant sentence(s) from sources as a deterministic reply
        const lines = sourcesText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        answer = lines.slice(0, 3).join(" ").slice(0, 400);
        if (!answer) {
          answer =
            "I can answer questions about Sea View Skydiving from my knowledge base.";
        }
      } else {
        answer =
          "No relevant information found. Please contact Greedy Adventures directly for assistance.";
      }

      content.push({ type: "text", text: answer });

      return {
        content,
        finishReason: { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: {
            total: 0,
            noCache: 0,
            cacheRead: 0,
            cacheWrite: 0,
          },
          outputTokens: {
            total: 0,
            text: 0,
            reasoning: 0,
          },
        },
        warnings: [],
      };
    },
    doStream: async (options) => {
      // Delegate to doGenerate logic
      const result = await mock.doGenerate(options);

      const parts: LanguageModelV4StreamPart[] = [];

      for (const part of result.content) {
        if (part.type === "tool-call") {
          parts.push({
            type: "tool-call",
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            input: part.input,
          });
        } else if (part.type === "text") {
          const textId = "text-1";
          parts.push({ type: "text-start", id: textId });
          parts.push({ type: "text-delta", id: textId, delta: part.text });
          parts.push({ type: "text-end", id: textId });
        }
      }

      parts.push({
        type: "finish",
        finishReason: result.finishReason,
        usage: result.usage,
      });

      const stream = new ReadableStream<LanguageModelV4StreamPart>({
        start(controller) {
          for (const p of parts) {
            controller.enqueue(p);
          }
          controller.close();
        },
      });

      return {
        stream,
        warnings: [],
      };
    },
  });

  return mock;
}
