import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type UIMessage,
} from "ai";
import { ChatBodySchema } from "@/lib/schemas";
import { prepare } from "@/lib/chat/pipeline";
import { getModel, getModelId, isMockMode } from "@/lib/chat/model";

export const maxDuration = 30;

export async function GET() {
  return NextResponse.json({
    mode: isMockMode() ? "mock" : "live",
    modelId: getModelId(),
  });
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
    const model = await getModel();

    const modelMessages = await convertToModelMessages(messages, {
      tools: ctx.tools as Parameters<typeof convertToModelMessages>[1] extends { tools?: infer T } ? T : never,
    });

    const result = streamText({
      model,
      system: ctx.system,
      messages: modelMessages,
      ...(ctx.tools
        ? { tools: ctx.tools as Parameters<typeof streamText>[0]["tools"] }
        : {}),
      ...(ctx.toolChoice ? { toolChoice: ctx.toolChoice } : {}),
      ...(ctx.tools ? { stopWhen: stepCountIs(5) } : {}),
      abortSignal: req.signal,
    });

    // Send source metadata with each message
    const sources = ctx.chunks.map((c) => ({
      title: c.sourceTitle,
      url: c.sourceUrl,
    }));

    const uiStream = toUIMessageStream({
      stream: result.stream,
      tools: ctx.tools as Parameters<typeof toUIMessageStream>[0]["tools"],
      messageMetadata: sources.length > 0 ? () => ({ custom: { sources } }) : undefined,
    });

    return createUIMessageStreamResponse({ stream: uiStream });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please try again in a moment." },
        { status: 429 }
      );
    }
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "The request timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
