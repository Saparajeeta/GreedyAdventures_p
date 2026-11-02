import { MockLanguageModelV4 } from "ai/test";
import type {
  LanguageModelV4,
  LanguageModelV4Content,
  LanguageModelV4StreamPart,
} from "@ai-sdk/provider";
import { isUnrelatedQuestion, UNRELATED_REDIRECT_MESSAGE } from "./failure";

export interface MockModelOptions {
  fallbackReason?: string;
}

/**
 * Deterministic mock language model.
 * - Produces grounded extractive answers from knowledge sources.
 * - Handles tool calls for brochure and video requests.
 * - Formats fallback responses when a live model error occurs.
 */
export function createMockModel(options?: MockModelOptions): LanguageModelV4 {
  const fallbackReason = options?.fallbackReason;

  const mock: LanguageModelV4 = new MockLanguageModelV4({
    provider: "mock",
    modelId: "mock-model",
    doGenerate: async (callOptions) => {
      const tools = callOptions.tools ?? [];
      const toolNames = tools.map((t) => t.name);

      // Extract last user message text
      const messages = callOptions.prompt;
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

      // Check if question is unrelated
      if (isUnrelatedQuestion(lastUserText)) {
        return {
          content: [{ type: "text", text: UNRELATED_REDIRECT_MESSAGE }],
          finishReason: { unified: "stop", raw: "stop" },
          usage: {
            inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
            outputTokens: { total: 0, text: 0, reasoning: 0 },
          },
          warnings: [],
        };
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
      }
      if (wantsVideo) {
        content.push({
          type: "tool-call",
          toolCallId: "mock-video-call",
          toolName: "getVideo",
          input: "{}",
        });
      }

      // If calling tools in this step, don't emit text yet
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

      // Build extractive answer from sources
      let rawAnswer = "";
      if (alreadyCalledTools.size > 0) {
        const hasBrochure = alreadyCalledTools.has("getBrochure");
        const hasVideo = alreadyCalledTools.has("getVideo");
        if (hasBrochure && hasVideo) {
          rawAnswer = "Here is the brochure and jump video for Sea View Skydiving.";
        } else if (hasBrochure) {
          rawAnswer = "Here is the brochure.";
        } else if (hasVideo) {
          rawAnswer = "Here is the video.";
        }
      } else if (/\bparking\b|\bpark\b/.test(lowerQuery)) {
        rawAnswer =
          "That detail is not listed on the Greedy Adventures pages I have, so I do not want to guess. Please contact Greedy Adventures by phone at +91 95357 68554 or on WhatsApp.";
      } else if (/\b(mount abu|india)\b/.test(lowerQuery)) {
        rawAnswer =
          "Mount Abu tandem jump options are ₹29,999 per person for Handycam Video and ₹39,999 per person for Outside Cameraman, both excluding GST.";
      } else if (/\bdifference\b/.test(lowerQuery) && /\bdeluxe\b/.test(lowerQuery) && /\bvip\b/.test(lowerQuery)) {
        rawAnswer =
          "DELUXE (฿12,500) includes wrist-mounted Handycam 4K video and photos filmed by your instructor. VIP (฿14,000) includes a dedicated camera flyer jumping alongside you with edited film and photos. Both include the full 13,000 ft jump and briefing.";
      } else if (/\bvip\b/.test(lowerQuery) && (/\bmuch\b/.test(lowerQuery) || /\bprice\b/.test(lowerQuery) || /\bcost\b/.test(lowerQuery))) {
        rawAnswer =
          "VIP is ฿14,000 per person. Includes tandem jump, safety briefing and instructor, aircraft ascent, certificate of completion, plus a dedicated camera flyer jumping alongside you with edited film and photos.";
      } else if (/\bpackage\b|\bpackages\b|\bincluded\b/.test(lowerQuery)) {
        rawAnswer =
          "• ECO (฿9,500 per person): The jump, nothing else. Includes tandem jump, safety briefing and instructor, aircraft ascent, and certificate of completion. No camera.\n• DELUXE (฿12,500 per person): Video and photos included. Includes tandem jump, safety briefing and instructor, aircraft ascent, certificate of completion, plus wrist-mounted Handycam 4K video and high-res digital photos.\n• VIP (฿14,000 per person): Personal cameraman and edited film. Includes tandem jump, safety briefing and instructor, aircraft ascent, certificate of completion, plus a dedicated camera flyer jumping alongside you with edited film and photos.";
      } else if (/\bcanopy\b/.test(lowerQuery)) {
        rawAnswer =
          "Canopy flight lasts five to seven minutes (5–7 min) along the coast before touching down safely at the dropzone.";
      } else if (/\bhigh\b|\bfreefall\b|\baltitude\b/.test(lowerQuery)) {
        rawAnswer =
          "Exit altitude is 13,000 ft over the Gulf of Thailand, followed by around sixty seconds (~60s) of freefall.";
      } else if (/\bhow long\b/.test(lowerQuery) && /\bdropzone\b/.test(lowerQuery)) {
        rawAnswer =
          "Budget about 3 hours at the dropzone for check-in, safety briefing, gear fitting, the flight, the jump, and collecting your media.";
      } else if (/\bgopro\b|\bcamera\b/.test(lowerQuery)) {
        rawAnswer =
          "No. Dropzones do not allow unlicensed jumpers to carry cameras or personal GoPros for safety reasons.";
      } else if (/\bwear\b|\bclothes\b|\bshoes\b/.test(lowerQuery)) {
        rawAnswer =
          "Wear comfortable clothes and trainers. No sandals or loose jewellery are allowed during the jump.";
      } else if (/\bbangkok\b/.test(lowerQuery)) {
        rawAnswer =
          "Yes. Bangkok pickup is available as a fixed-price add-on directly to the dropzone (price on request).";
      } else if (/\bwhere\b/.test(lowerQuery) && /\bdropzone\b/.test(lowerQuery)) {
        rawAnswer =
          "Pattaya Sea View dropzone is at 95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand, operated by Dropzone Thailand.";
      } else if (/\bexperience\b/.test(lowerQuery)) {
        rawAnswer =
          "None at all. On a tandem jump you are harnessed to a USPA-certified instructor who handles the exit, freefall and landing.";
      } else if (/\bweather\b/.test(lowerQuery)) {
        rawAnswer =
          "If weather stops you jumping, you do not lose your money: you move to the next window or another date at no cost, or receive a refund.";
      } else if (/\bcancel\b/.test(lowerQuery)) {
        rawAnswer =
          "You can cancel free of charge up to 48 hours before your jump date. Within 48 hours, deposit cancellation terms apply.";
      } else if (/\badvance\b|\bpay\b/.test(lowerQuery)) {
        rawAnswer =
          "No advance payment is needed to hold your slot. You pay at the dropzone on the day of the jump.";
      } else if (/\bweight\b/.test(lowerQuery)) {
        rawAnswer =
          "You must be 18 or older with valid ID. The weight limit is 100 kg for tandem jumps in Pattaya, and weight must be proportional to height.";
      } else if (/\badd video\b|\blater\b/.test(lowerQuery)) {
        rawAnswer =
          "Yes, you can add or upgrade video and photo packages at the dropzone on the day of the jump.";
      } else if (/\badventures\b|\boffer\b/.test(lowerQuery)) {
        rawAnswer =
          "Greedy Adventures offers tandem skydiving in Pattaya (Thailand) and Mount Abu (India). Paragliding, scuba diving and snowboarding are coming soon.";
      } else {
        rawAnswer =
          "I can answer questions about Sea View Skydiving packages, prices, inclusions, the day plan, location, and sending the brochure or video.";
      }

      const answer = fallbackReason
        ? `Fallback answer (${fallbackReason}). Here is the closest text from the Greedy Adventures website:\n${rawAnswer}`
        : rawAnswer;

      content.push({ type: "text", text: answer });

      return {
        content,
        finishReason: { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 0, text: 0, reasoning: 0 },
        },
        warnings: [],
      };
    },
    doStream: async (callOptions) => {
      const result = await mock.doGenerate(callOptions);

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
