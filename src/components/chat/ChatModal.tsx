"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, X, ExternalLink, Sparkles } from "lucide-react";
import {
  AssistantRuntimeProvider,
  AuiConfig,
  Tools,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/ai-sdk";
import { chatToolkit } from "./ChatToolkit";
import { ChatThread } from "./Thread";

interface ModeInfo {
  mode: "mock" | "live";
  modelId: string;
}

export function ChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modeInfo, setModeInfo] = useState<ModeInfo>({
    mode: "mock",
    modelId: "mock",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize assistant-ui runtime
  const runtime = useChatRuntime();
  const config = AuiConfig({
    tools: Tools({ toolkit: chatToolkit }),
  });

  // Fetch server mode info on mount
  useEffect(() => {
    let active = true;
    fetch("/api/chat")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setModeInfo({
            mode: data.mode === "live" ? "live" : "mock",
            modelId: data.modelId || "mock",
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Open modal if user clicks on any link pointing to #chat-assistant or dispatches ask-assistant
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a[href="#chat-assistant"]');
      if (target) {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    function handleAsk(e: Event) {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        runtime.thread.append(customEvent.detail.prompt);
      }
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("ask-assistant", handleAsk);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("ask-assistant", handleAsk);
    };
  }, [runtime]);
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls="assistant-chat-dialog"
          aria-label={isOpen ? "Close skydiving assistant" : "Ask our skydiving assistant"}
          className="group flex items-center gap-2.5 rounded-full bg-brand-teal px-4 py-3 text-white shadow-xl shadow-brand-teal/20 transition-all hover:bg-brand-teal/90 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            <span
              className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-brand-teal ${
                modeInfo.mode === "live" ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-wide">
            {isOpen ? "Close Assistant" : "Ask Our Assistant"}
          </span>
        </button>
      </div>

      {/* Floating assistant modal dialog */}
      {isOpen && (
        <div
          id="assistant-chat-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Sea View Skydiving Assistant"
          ref={modalRef}
          className="fixed bottom-20 right-3 sm:right-6 z-50 flex flex-col w-[calc(100vw-1.5rem)] sm:w-[410px] h-[580px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-brand-sand/70 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-7 w-7 rounded overflow-hidden shrink-0 border border-brand-teal/20">
                <Image
                  src="/logo.png"
                  alt="Greedy Adventures logo"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    Sea View Assistant
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      modeInfo.mode === "live"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        modeInfo.mode === "live" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {modeInfo.mode === "live" ? `Live: ${modeInfo.modelId}` : "Mock mode"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/knowledge"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Knowledge view and test pipeline"
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-brand-teal hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal transition-colors"
              >
                <span>Knowledge</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close chat modal"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Thread Content */}
          <div className="flex-1 min-h-0">
            <AssistantRuntimeProvider runtime={runtime} config={config}>
              <ChatThread />
            </AssistantRuntimeProvider>
          </div>
        </div>
      )}
    </>
  );
}
