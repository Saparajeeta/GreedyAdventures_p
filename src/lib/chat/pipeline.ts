import { streamText, generateText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { retrieve, type RetrievedChunk } from "@/lib/knowledge";
import { detectMediaIntent, type MediaIntent } from "@/lib/media/intent";
import { selectMedia } from "@/lib/media/registry";
import { getBrochure, getVideo } from "./tools";
import { getModel, getModelId, isMockMode } from "./model";
import type { MediaItem } from "@/lib/schemas";

const MAX_HISTORY = 12;

export interface PipelineContext {
  system: string;
  tools: Record<string, unknown> | undefined;
  toolChoice: "required" | "auto" | undefined;
  chunks: RetrievedChunk[];
  intent: MediaIntent;
  contextSentToModel: string;
}

export interface TraceResult {
  question: string;
  retrievalQuery: string;
  chunks: Array<{
    title: string;
    url: string;
    heading: string;
    score: number;
    text: string;
  }>;
  contextSentToModel: string;
  intentMatched: string[];
  mediaSelected: { pdf: MediaItem | null; video: MediaItem | null };
  mode: "mock" | "live";
  modelId: string;
  latencyMs: number;
  answer: string;
}

function buildRetrievalQuery(messages: Array<{ role: string; content?: string | unknown[] }>): string {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return "";

  const last = userMessages[userMessages.length - 1];
  const lastText = extractText(last);

  if (lastText.split(/\s+/).length < 6 && userMessages.length > 1) {
    const prev = userMessages[userMessages.length - 2];
    return extractText(prev) + " " + lastText;
  }

  return lastText;
}

function extractText(msg: { content?: string | unknown[] }): string {
  if (!msg.content) return "";
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((p): p is { type: "text"; text: string } => (p as { type: string }).type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  return "";
}

function buildSourcesBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "## SOURCES\n(No relevant sources found for this query.)";
  }

  const parts = chunks.map((c) => {
    return `### ${c.sourceTitle} — ${c.heading}\nURL: ${c.sourceUrl}\n\n${c.text}`;
  });

  return `## SOURCES\n${parts.join("\n\n---\n\n")}`;
}

function buildSystemPrompt(sourcesBlock: string): string {
  return `You are the Sea View Skydiving assistant for Greedy Adventures. Answer ONLY from the sources provided below.

Rules:
- If nothing in the SOURCES answers the question, say so plainly and direct the user to contact Greedy Adventures. Use only contact details found word for word in the SOURCES.
- Never invent prices, limits, dates, policies, or contact details.
- Be concise.
- For media requests: call the appropriate tool, then add one short descriptive sentence.
- If a tool returns unavailable, say so clearly.
- Do not paste raw file URLs (the UI card will show them).

${sourcesBlock}`;
}

export async function prepare(messages: UIMessage[]): Promise<PipelineContext> {
  // Cap history
  const capped = messages.slice(-MAX_HISTORY);

  // Retrieval query
  const retrievalQuery = buildRetrievalQuery(
    capped.map((m) => ({ role: m.role, content: m.parts }))
  );

  const chunks = retrievalQuery ? retrieve(retrievalQuery, 4) : [];

  // Intent detection — use last user message text
  const lastUser = [...capped].reverse().find((m) => m.role === "user");
  const lastUserText = lastUser
    ? extractText({ content: lastUser.parts })
    : "";
  const intent = detectMediaIntent(lastUserText);

  // Build tools
  let tools: Record<string, unknown> | undefined;
  let toolChoice: "required" | "auto" | undefined;

  if (intent.brochure || intent.video) {
    tools = {};
    if (intent.brochure) (tools as Record<string, unknown>).getBrochure = getBrochure;
    if (intent.video) (tools as Record<string, unknown>).getVideo = getVideo;
    toolChoice = "required";
  }

  // Build context
  const sourcesBlock = buildSourcesBlock(chunks);
  const system = buildSystemPrompt(sourcesBlock);

  return {
    system,
    tools,
    toolChoice,
    chunks,
    intent,
    contextSentToModel: system,
  };
}

/** Run the pipeline for streaming chat. */
export async function runStream(messages: UIMessage[]): Promise<ReturnType<typeof streamText>> {
  const { system, tools, toolChoice } = await prepare(messages);
  const model = await getModel();

  const modelMessages = await convertToModelMessages(messages, { tools: tools as Parameters<typeof convertToModelMessages>[1] extends { tools?: infer T } ? T : never });

  return streamText({
    model,
    system,
    messages: modelMessages,
    ...(tools ? { tools: tools as Parameters<typeof streamText>[0]["tools"] } : {}),
    ...(toolChoice ? { toolChoice } : {}),
    ...(tools ? { stopWhen: stepCountIs(5) } : {}),
    abortSignal: undefined,
  });
}

/** Run the pipeline for the knowledge test endpoint (generateText). Returns trace. */
export async function runTest(question: string): Promise<TraceResult> {
  const start = Date.now();
  const mockMessages: UIMessage[] = [
    {
      id: "test-1",
      role: "user",
      parts: [{ type: "text", text: question }],
      metadata: {},
    },
  ];

  const ctx = await prepare(mockMessages);
  const model = await getModel();

  const modelMessages = await convertToModelMessages(mockMessages, {
    tools: ctx.tools as Parameters<typeof convertToModelMessages>[1] extends { tools?: infer T } ? T : never,
  });

  let answer = "";
  let mediaSelected: { pdf: MediaItem | null; video: MediaItem | null } = {
    pdf: null,
    video: null,
  };

  try {
    const result = await generateText({
      model,
      system: ctx.system,
      messages: modelMessages,
      ...(ctx.tools ? { tools: ctx.tools as Parameters<typeof generateText>[0]["tools"] } : {}),
      ...(ctx.toolChoice ? { toolChoice: ctx.toolChoice } : {}),
      ...(ctx.tools ? { stopWhen: stepCountIs(5) } : {}),
    });

    answer = result.text;

    // Collect media from tool results
    for (const step of result.steps ?? []) {
      for (const toolResult of step.toolResults ?? []) {
        const r = toolResult.output as { available: boolean; item?: MediaItem };
        if (r?.available && r.item) {
          if (r.item.type === "pdf") mediaSelected.pdf = r.item;
          if (r.item.type === "video") mediaSelected.video = r.item;
        }
      }
    }
  } catch (err) {
    answer = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  // Fall back to selectMedia for intent-matched types that pipeline would show
  if (ctx.intent.brochure && !mediaSelected.pdf) {
    mediaSelected.pdf = selectMedia("pdf");
  }
  if (ctx.intent.video && !mediaSelected.video) {
    mediaSelected.video = selectMedia("video");
  }

  const latencyMs = Date.now() - start;

  return {
    question,
    retrievalQuery: question,
    chunks: ctx.chunks.map((c) => ({
      title: c.sourceTitle,
      url: c.sourceUrl,
      heading: c.heading,
      score: c.score,
      text: c.text,
    })),
    contextSentToModel: ctx.contextSentToModel,
    intentMatched: ctx.intent.matched,
    mediaSelected,
    mode: isMockMode() ? "mock" : "live",
    modelId: getModelId(),
    latencyMs,
    answer,
  };
}
