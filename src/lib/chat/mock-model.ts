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
      const alreadyCalledTools = messages.some((m) => m.role === "tool");

      // Decide which tools to call
      const wantsBrochure =
        !alreadyCalledTools &&
        toolNames.includes("getBrochure") &&
        /brochure|pdf|flyer|leaflet/.test(lowerQuery);
      const wantsVideo =
        !alreadyCalledTools &&
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
      if (alreadyCalledTools) {
        answer = "Here is the requested media for Sea View Skydiving.";
      } else if (/weight|kg|heavy/.test(lowerQuery)) {
        answer =
          "Weight limits are not listed in our Sea View Skydiving sources. Please contact the Greedy Adventures crew directly at crew@greedyadventures.com or +66 61 585 0055.";
      } else if (sourcesText && !sourcesText.startsWith("(No relevant")) {
        // Use the first chunk: lines before the next "---" separator or end
        const firstChunk = sourcesText.split(/\n---\n/)[0].trim();
        const lines = firstChunk
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("###") && !l.startsWith("URL:"));
        answer = lines.slice(0, 4).join(" ").slice(0, 500);
        if (!answer) {
          answer =
            "I can answer questions about Sea View Skydiving from my knowledge base.";
        }
      } else {
        answer =
          "I don't have information about that in my sources. Please contact Greedy Adventures at crew@greedyadventures.com or +66 61 585 0055.";
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
