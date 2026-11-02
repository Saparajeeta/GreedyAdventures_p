import { streamText, generateText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { retrieve, type RetrievedChunk } from "@/lib/knowledge";
import { detectMediaIntent, type MediaIntent } from "@/lib/media/intent";
import { selectMedia } from "@/lib/media/registry";
import { getBrochure, getVideo } from "./tools";
import { getModel, getModelId, isMockMode } from "./model";
import type { MediaItem } from "@/lib/schemas";

const MAX_HISTORY = 6;

export interface PipelineContext {
  system: string;
  tools?: Record<string, unknown>;
  toolChoice?: "required" | "auto";
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
    location?: string;
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
    return `### [Location: ${c.location}] ${c.sourceTitle} — ${c.heading}\nURL: ${c.sourceUrl}\n\n${c.text}`;
  });

  return `## SOURCES\n${parts.join("\n\n---\n\n")}`;
}

function buildSystemPrompt(sourcesBlock: string): string {
  return `You are the Sea View Skydiving assistant for Greedy Adventures in Pattaya, Thailand. Answer ONLY from the sources provided below.

Rules:
- This assistant is for Greedy Adventures and Sea View Skydiving in Pattaya, Thailand. Treat questions as about Pattaya unless the user names Mount Abu or India.
- Use only sources for the question's location. Never mix prices, currencies, age or weight limits between locations.
- If the question is ambiguous between Pattaya and Mount Abu, answer for Pattaya and add "Mount Abu is different, ask me if you want those details."
- When the question is on topic but not in the sources, say: "That detail is not listed on the Greedy Adventures pages I have, so I do not want to guess." Then give the contact details found word for word in SOURCES (phone +91 95357 68554 and WhatsApp from contact.md).
- If the question is an unrelated question, say: "That is outside what I can help with. I can help with Sea View Skydiving and Greedy Adventures: packages, prices, what is included, the day plan, location, and sending the brochure or video."
- If a requested file is not in the registry or a tool returns unavailable, say: "That file is not available right now." and suggest the available brochure and video.
- For an on-topic question answered by the sources, answer briefly and fully. When listing packages, use short bullets and write prices exactly with their currency symbol.
- Never refuse an on-topic question because it is phrased unusually. Never invent facts, prices, limits, dates, policies, or contact details. Short friendly sentences.
- For each requested media item, call its required tool and add one separate short sentence, such as "Here is the brochure." or "Here is the video."
- Do not paste raw file URLs (the UI card will show them).

${sourcesBlock}`;
}

export function requireIntentTools(toolNames: string[]) {
  return ({ steps }: { steps: Array<{ toolCalls: Array<{ toolName: string }> }> }) => {
    const called = new Set(
      steps.flatMap((step) => step.toolCalls.map((call) => call.toolName))
    );
    const remaining = toolNames.filter((toolName) => !called.has(toolName));

    return {
      activeTools: remaining,
      toolChoice: remaining.length > 0 ? ("required" as const) : ("auto" as const),
    };
  };
}

export async function prepare(messages: UIMessage[]): Promise<PipelineContext> {
  // Cap history
  const capped = messages.slice(-MAX_HISTORY);

  // Retrieval query
  const retrievalQuery = buildRetrievalQuery(
    capped.map((m) => ({ role: m.role, content: m.parts }))
  );

  const retrieved = retrievalQuery ? retrieve(retrievalQuery, 5) : [];

  // Limit to top 5 passages and about 3,500 characters
  let charCount = 0;
  const chunks: RetrievedChunk[] = [];
  for (const chunk of retrieved.slice(0, 5)) {
    if (charCount + chunk.text.length > 3800 && chunks.length > 0) break;
    chunks.push(chunk);
    charCount += chunk.text.length;
  }

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
  const { system } = await prepare(messages);
  const model = await getModel();

  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model,
    system,
    messages: modelMessages,
    maxRetries: 0,
    maxOutputTokens: 600,
    providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
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

  const modelMessages = await convertToModelMessages(mockMessages);

  let answer = "";
  const mediaSelected: { pdf: MediaItem | null; video: MediaItem | null } = {
    pdf: ctx.intent.brochure ? selectMedia("pdf") : null,
    video: ctx.intent.video ? selectMedia("video") : null,
  };

  try {
    const result = await generateText({
      model,
      system: ctx.system,
      messages: modelMessages,
      maxRetries: 0,
      maxOutputTokens: 600,
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
    });

    answer = result.text;
  } catch (err) {
    answer = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  const latencyMs = Date.now() - start;

  return {
    question,
    retrievalQuery: question,
    chunks: ctx.chunks.map((c) => ({
      title: c.sourceTitle,
      url: c.sourceUrl,
      location: c.location,
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
