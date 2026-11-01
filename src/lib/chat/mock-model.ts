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
          if (typeof msg.content === "string") {
            lastUserText = msg.content;
          } else if (Array.isArray(msg.content)) {
            const textPart = msg.content.find(
              (c): c is { type: "text"; text: string } =>
                (c as { type?: string }).type === "text"
            );
            if (textPart) {
              lastUserText = textPart.text;
            }
          }
          break;
        }
      }

      // Extract SOURCES block from system prompt
      let sourcesText = "";
      const systemMsg = messages.find((m) => m.role === "system");
      if (systemMsg) {
        const rawContent = (systemMsg as { content?: unknown }).content;
        const sysContent =
          typeof rawContent === "string"
            ? rawContent
            : Array.isArray(rawContent)
            ? (rawContent as Array<{ type?: string; text?: string }>)
                .filter((c) => c.type === "text")
                .map((c) => c.text ?? "")
                .join("")
            : "";
        const idx = sysContent.indexOf("## SOURCES");
        if (idx !== -1) {
          sourcesText = sysContent.substring(idx + "## SOURCES".length).trim();
        }
      }

      const lowerQuery = lastUserText.toLowerCase();

      // Check if tools were already executed in a previous step of this multi-step turn
      const alreadyCalledTools = new Set(
        messages.flatMap((message) => {
          if (message.role !== "tool" || !Array.isArray(message.content)) return [];
          return message.content.flatMap((part) => {
            const result = part as { type?: string; toolName?: string };
            return result.type === "tool-result" && result.toolName
              ? [result.toolName]
              : [];
          });
        })
      );
      const wantsBrochure =
        toolNames.includes("getBrochure") &&
        !alreadyCalledTools.has("getBrochure") &&
        /\b(brochure|pdf|flyer|leaflet|info[\s-]+sheet)\b/.test(lowerQuery);
      const wantsVideo =
        toolNames.includes("getVideo") &&
        !alreadyCalledTools.has("getVideo") &&
        /\b(video|footage|clip|reel|film|watch)\b/.test(lowerQuery);

      const content: LanguageModelV4Content[] = [];

      if (wantsBrochure) {
        content.push({
          type: "tool-call",
          toolCallId: "mock-brochure-call",
          toolName: "getBrochure",
          input: "{}",
        });
      } else if (wantsVideo) {
        content.push({
          type: "tool-call",
          toolCallId: "mock-video-call",
          toolName: "getVideo",
          input: "{}",
        });
      }

      // If calling tools in this step, don't emit text yet (AI SDK will loop for step 2)
      if (wantsBrochure || wantsVideo) {
        return {
          content,
          finishReason: { unified: "tool-calls", raw: "tool_calls" },
          usage: {
            inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
            outputTokens: { total: 0, text: 0, reasoning: 0 },
          },
          warnings: [],
        };
      }

      // Generate answer
      let answer = "";
      if (alreadyCalledTools.size > 0) {
        const sentences = [
          alreadyCalledTools.has("getBrochure") ? "Here is the brochure." : "",
          alreadyCalledTools.has("getVideo") ? "Here is the video." : "",
        ].filter(Boolean);
        answer = sentences.join(" ");
      } else if (/parking|park your car/.test(lowerQuery)) {
        answer =
          "Information about parking is not listed in our website sources. Please contact the Greedy Adventures crew directly on WhatsApp or call +91 95357 68554 for assistance.";
      } else if (sourcesText && !sourcesText.startsWith("(No relevant")) {
        // Use the first chunk: lines before the next "---" separator or end
        const firstChunk = sourcesText.split(/\n---\n/)[0].trim();
        const lines = firstChunk
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("###") && !l.startsWith("URL:"));

        // If a line in the chunk directly matches the query topic, start from that line
        const matchingLineIdx = lines.findIndex((l) =>
          lowerQuery
            .split(/\s+/)
            .some((w) => w.length > 3 && l.toLowerCase().includes(w))
        );
        const startIdx = matchingLineIdx !== -1 ? matchingLineIdx : 0;
        answer = lines.slice(startIdx, startIdx + 4).join(" ").slice(0, 500);
        if (!answer) {
          answer =
            "I can answer questions about Sea View Skydiving from my knowledge base.";
        }
      } else {
        answer =
          "I don't have information about that in my sources. Please contact Greedy Adventures on WhatsApp or call +91 95357 68554.";
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
