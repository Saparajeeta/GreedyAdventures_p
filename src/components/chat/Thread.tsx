"use client";

import React from "react";
import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
  AuiIf,
} from "@assistant-ui/react";
import { useMessageError, useMessageReload } from "@assistant-ui/core/react";
import { Send, Square, Sparkles, RefreshCw } from "lucide-react";
import { SafeMarkdown } from "./SafeMarkdown";
import { SourceChips, type SourceItem } from "./SourceChips";

const SUGGESTIONS = [
  "What is included in the packages?",
  "Send me a brochure",
  "Can I see a video of the jump?",
  "Send me a brochure and a video",
];

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end my-2">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-teal px-4 py-2.5 text-sm text-white shadow-sm">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

const EMPTY_SOURCES: SourceItem[] = [];

function AssistantMessage() {
  const sources = useAuiState((s) => {
    const raw = (s as unknown as { message?: { metadata?: { custom?: { sources?: SourceItem[] } } } })
      ?.message?.metadata?.custom?.sources;
    return Array.isArray(raw) ? raw : EMPTY_SOURCES;
  });

  const error = useMessageError();
  const { reload, canReload } = useMessageReload();

  return (
    <MessagePrimitive.Root className="flex gap-2.5 my-3 max-w-full">
      <div className="h-7 w-7 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
        GA
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-200/70 px-4 py-3 shadow-xs">
          <MessagePrimitive.Parts
            components={{
              Text: SafeMarkdown,
            }}
          />

          {error && (
            <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center justify-between gap-2">
              <span>
                {typeof error === "string" ? error : "An error occurred. Please try again."}
              </span>
              {canReload && (
                <button
                  type="button"
                  onClick={reload}
                  className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              )}
            </div>
          )}

          <SourceChips sources={sources} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function EmptyWelcome() {
  return (
    <div className="p-4 flex flex-col justify-center min-h-[300px]">
      <div className="text-center mb-6">
        <div className="mx-auto w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-3">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900">
          Sea View Skydiving Assistant
        </h3>
        <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto">
          Ask questions about tandem skydiving in Pattaya, packages, pricing, jump video footage, or request our brochure.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Suggested questions
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {SUGGESTIONS.map((prompt) => (
            <ThreadPrimitive.Suggestion
              key={prompt}
              prompt={prompt}
              send
              className="w-full text-left rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-teal/40 px-3 py-2 text-xs text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              {prompt}
            </ThreadPrimitive.Suggestion>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full bg-white text-slate-900">
      <ThreadPrimitive.Viewport
        autoScroll
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth"
        aria-live="polite"
      >
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <EmptyWelcome />
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Composer at bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <ComposerPrimitive.Root className="relative flex items-end rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal transition-all">
          <ComposerPrimitive.Input
            placeholder="Ask about skydiving packages, video, dropzone..."
            className="w-full resize-none border-0 bg-transparent px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none max-h-28 min-h-[42px]"
            aria-label="Type your skydiving question"
          />
          <div className="pr-2 pb-2">
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel
                aria-label="Stop generating response"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                <Square className="h-3 w-3 fill-current" />
              </ComposerPrimitive.Cancel>
            </AuiIf>
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send
                aria-label="Send message"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal text-white hover:bg-brand-teal/90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                <Send className="h-3.5 w-3.5" />
              </ComposerPrimitive.Send>
            </AuiIf>
          </div>
        </ComposerPrimitive.Root>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          Answers grounded only in official website knowledge.
        </p>
      </div>
    </ThreadPrimitive.Root>
  );
}
