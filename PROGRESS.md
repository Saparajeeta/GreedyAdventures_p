# Project Changelog

## Current State
- Sea View Skydiving landing page with package comparison (ECO, DELUXE, VIP), package selection panel, and Google Maps link.
- Static knowledge snapshots from greedyadventures.com with location tagging (Pattaya, Mount Abu, General).
- In-memory BM25 retrieval (k1=1.2, b=0.75) chunked by markdown headings (<=1000 chars).
- Assistant chat modal built with assistant-ui, keyboard accessible focus, and prompt suggestions.
- Server-side media intent detection: emits PDF brochure and jump video cards directly without model tool calls. Pure media requests skip the LLM.
- Dual provider setup: Google Gemini as primary, Groq as backup, with automatic 12-second timeout and failover.
- Extractive fallback with a polite busy notice if all live providers fail.
- Grounded system prompt: Pattaya default, strict refusal on missing facts, redirect for off-topic questions.
- Plain-language knowledge view (`/knowledge`) showing loaded source pages, shareable files, and a test query runner with per-request audit trace.
- Vitest test suite with 132 passing unit tests across 12 files (intent, retrieval, media registry, failover, schemas, mock pipeline).
