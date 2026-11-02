import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { ChatBodySchema } from "@/lib/schemas";
import { prepare } from "@/lib/chat/pipeline";
import { getModel, getModelId, isMockMode } from "@/lib/chat/model";
import { classifyModelError, logFailure } from "@/lib/chat/failure";
import { isMediaOnlyRequest } from "@/lib/media/intent";
import { selectMedia } from "@/lib/media/registry";
import type { MediaItem } from "@/lib/schemas";

export const maxDuration = 30;

export async function GET() {
  return NextResponse.json({
    mode: isMockMode() ? "mock" : "live",
    modelId: getModelId(),
  });
}

function extractLastUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  return lastUser.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof (p as { text?: unknown }).text === "string")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ChatBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Bad request" },
      { status: 400 }
    );
  }

  const messages = parsed.data.messages as unknown as UIMessage[];

  try {
    const ctx = await prepare(messages);
    const lastUserText = extractLastUserText(messages);
    const hasMediaIntent = ctx.intent.brochure || ctx.intent.video;

    const sources = ctx.chunks.map((c) => ({
      title: c.sourceTitle,
      url: c.sourceUrl,
    }));

    if (hasMediaIntent) {
      const mediaItems: Array<{
        toolName: "getBrochure" | "getVideo";
        result: { available: true; item: MediaItem } | { available: false; reason: string };
      }> = [];

      if (ctx.intent.brochure) {
        const item = selectMedia("pdf");
        mediaItems.push({
          toolName: "getBrochure",
          result: item
            ? { available: true, item }
            : { available: false, reason: "No brochure on file." },
        });
      }

      if (ctx.intent.video) {
        const item = selectMedia("video");
        mediaItems.push({
          toolName: "getVideo",
          result: item
            ? { available: true, item }
            : { available: false, reason: "No video on file." },
        });
      }

      // Check if message is ONLY a media request (no model call required)
      if (isMediaOnlyRequest(lastUserText)) {
        let answer = "";
        if (ctx.intent.brochure && ctx.intent.video) {
          answer = "Here is the brochure and jump video for Sea View Skydiving.";
        } else if (ctx.intent.brochure) {
          answer = "Here is the brochure for Sea View Skydiving.";
        } else if (ctx.intent.video) {
          answer = "Here is the jump video for Sea View Skydiving.";
        }

        const stream = createUIMessageStream({
          originalMessages: messages,
          execute: ({ writer }) => {
            writer.write({
              type: "start",
              messageMetadata: sources.length > 0 ? { custom: { sources } } : undefined,
            });
            for (const media of mediaItems) {
              const toolCallId = crypto.randomUUID();
              writer.write({
                type: "tool-input-available",
                toolCallId,
                toolName: media.toolName,
                input: {},
              });
              writer.write({
                type: "tool-output-available",
                toolCallId,
                output: media.result,
              });
            }
            const textId = crypto.randomUUID();
            writer.write({ type: "text-start", id: textId });
            writer.write({ type: "text-delta", id: textId, delta: answer });
            writer.write({ type: "text-end", id: textId });
            writer.write({ type: "finish" });
          },
        });

        return createUIMessageStreamResponse({ stream });
      }

      // Media request that also asks something else: make 1 model call and prepend cards
      const model = await getModel();
      const modelMessages = await convertToModelMessages(messages);

      const result = streamText({
        model,
        system: ctx.system,
        messages: modelMessages,
        maxRetries: 0,
        maxOutputTokens: 600,
        abortSignal: req.signal,
      });

      const modelUiStream = toUIMessageStream({
        stream: result.stream,
        sendStart: false,
      });

      const stream = createUIMessageStream({
        originalMessages: messages,
        execute: async ({ writer }) => {
          writer.write({
            type: "start",
            messageMetadata: sources.length > 0 ? { custom: { sources } } : undefined,
          });
          for (const media of mediaItems) {
            const toolCallId = crypto.randomUUID();
            writer.write({
              type: "tool-input-available",
              toolCallId,
              toolName: media.toolName,
              input: {},
            });
            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: media.result,
            });
          }
          await writer.merge(modelUiStream);
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    // Standard message without media: single model call
    const model = await getModel();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: ctx.system,
      messages: modelMessages,
      maxRetries: 0,
      maxOutputTokens: 600,
      abortSignal: req.signal,
    });

    const uiStream = toUIMessageStream({
      stream: result.stream,
      messageMetadata: sources.length > 0 ? () => ({ custom: { sources } }) : undefined,
    });

    return createUIMessageStreamResponse({ stream: uiStream });
  } catch (err) {
    const failure = classifyModelError(err);
    logFailure(failure.category, failure.status);
    return NextResponse.json(
      { error: failure.reason },
      { status: failure.status && failure.status >= 400 && failure.status < 600 ? failure.status : 500 }
    );
  }
}
