import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { ChatBodySchema } from "@/lib/schemas";
import { prepare } from "@/lib/chat/pipeline";
import { getModel, getModelId, isMockMode } from "@/lib/chat/model";
import { classifyModelError, logFailure } from "@/lib/chat/failure";

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

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: ctx.system,
      messages: modelMessages,
      maxRetries: 0,
      maxOutputTokens: 600,
      abortSignal: req.signal,
    });

    // Send source metadata with each message
    const sources = ctx.chunks.map((c) => ({
      title: c.sourceTitle,
      url: c.sourceUrl,
    }));

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
