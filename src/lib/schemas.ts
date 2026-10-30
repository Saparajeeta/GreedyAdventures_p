import { z } from "zod";

export const SourceDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  capturedAt: z.string(),
  category: z.string().default("general"),
  text: z.string(),
});
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

export const ChunkSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  sourceTitle: z.string(),
  sourceUrl: z.string(),
  section: z.string(),
  text: z.string(),
  score: z.number().optional(),
});
export type Chunk = z.infer<typeof ChunkSchema>;

export const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(["pdf", "video"]),
  title: z.string(),
  url: z.string(),
  sourceUrl: z.string().optional(),
  isDemo: z.boolean().default(true),
  description: z.string(),
  fileSize: z.string().optional(),
  duration: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

export const MediaRegistrySchema = z.object({
  items: z.array(MediaItemSchema),
});
export type MediaRegistry = z.infer<typeof MediaRegistrySchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000, "Message is too long"),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message length exceeded"),
  history: z.array(ChatMessageSchema).optional().default([]),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const TraceItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  timestamp: z.string(),
  mode: z.enum(["real", "mock"]),
  provider: z.string(),
  retrievedChunks: z.array(
    z.object({
      id: z.string(),
      sourceTitle: z.string(),
      sourceUrl: z.string(),
      section: z.string(),
      preview: z.string(),
      score: z.number(),
    })
  ),
  mediaChosen: z.array(MediaItemSchema),
  rawAnswerPreview: z.string().optional(),
});
export type TraceItem = z.infer<typeof TraceItemSchema>;

export const TestQuestionRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(500, "Question too long"),
});
export type TestQuestionRequest = z.infer<typeof TestQuestionRequestSchema>;

// ── Phase 2 schemas ──────────────────────────────────────────────────────────

/**
 * UI message part for the chat body (simplified subset of ai UIMessagePart).
 */
const UIMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().max(1000, "Message text too long").optional(),
}).passthrough();

/**
 * One message in the UIMessage array sent by assistant-ui.
 * role: "user" | "assistant" | "system"
 * parts: array of UIMessagePart
 */
export const UIMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(UIMessagePartSchema),
  metadata: z.record(z.unknown()).optional().default({}),
}).passthrough();
export type UIMessageInput = z.infer<typeof UIMessageSchema>;

/**
 * Chat request body from assistant-ui (array of UIMessages).
 * Max 40 messages; user text max 1000 chars (enforced in UIMessagePartSchema).
 */
export const ChatBodySchema = z.object({
  messages: z.array(UIMessageSchema).max(40, "Too many messages"),
});
export type ChatBody = z.infer<typeof ChatBodySchema>;

/**
 * Knowledge test request body.
 */
export const KnowledgeTestBodySchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(300, "Question too long"),
});
export type KnowledgeTestBody = z.infer<typeof KnowledgeTestBodySchema>;
