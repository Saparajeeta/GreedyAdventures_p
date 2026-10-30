# Project Progress

## Phase 1: Project Scaffolding & Core Architecture
- **What was done**: Initialized Next.js App Router (15.5) with strict TypeScript, Tailwind CSS, and Vitest. Configured Zod schemas in `src/lib/schemas.ts`, populated 4 static knowledge snapshot sources in `data/sources/`, initialized media registry `data/media.json`, and generated the sample demo PDF brochure in `public/media/` via `scripts/generate-demo-media.ts`. Verified with Vitest tests and production Next.js build.
- **Decisions**: Defaulted to Mock Mode in `.env.local` for instant offline testing without requiring API keys. Chose clean decoupled data paths (`/data/sources`, `/data/media.json`) to keep retrieval and media registry modular.
- **What's next**: Phase 2 - Knowledge Retrieval Engine & Media Selection Pipeline (chunking, BM25 scoring, media intent detection rules, in-memory trace buffer, unit tests).

## Phase 1b: Real UI & Grounded Source Snapshots
- **What was done**: Captured all 7 live website pages into `data/sources/*.md` with YAML frontmatter without inventing any facts or missing constraints (weight/age limits stay unanswerable). Configured `data/media.json` with the real jump video and strictly fact-grounded demo PDF brochure. Built the responsive, accessible Sea View Skydiving page with restrained `#12313f` deep-teal theme, hero stats, 3 package cards (ECO/DELUXE/VIP) + comparison row, 5-step plan with real dropzone images, highlights, and footer.
- **Decisions**: Configured `images.remotePatterns` for `greedyadventures.com` and Cloudflare R2 bucket. Built `SafeImage` with fallback error recovery. Added skip link, semantic landmarks, AA contrast, and 44px tap targets.
- **What's next**: Phase 2 - Knowledge Retrieval Engine (BM25 scoring, chunking) & Media Selection Pipeline (intent detection rules, in-memory trace buffer, unit tests).

## Phase 2: Knowledge Retrieval, Media Selection & Chat Pipeline (Backend)
- **Done**: Implemented source loader + heading-based chunker (<=800 chars) + BM25 retrieval (k1=1.2, b=0.75, stopword filtering) in `src/lib/knowledge`. Built regex media intent detection and registry in `src/lib/media`. Implemented server tools (`getBrochure`, `getVideo`), provider-swappable model factory (`src/lib/chat/model.ts`), deterministic mock model via AI SDK `MockLanguageModelV4`, and unified pipeline `prepare()`, `runChatStream()`, and `runTest()`. Added thin API routes (`/api/chat` and `/api/knowledge/test`) returning per-request traces and source metadata. All 51 unit tests passed across 6 test suites with 0 network calls.
- **Decisions**: Passed source citation chips to assistant-ui using `toUIMessageStream({ messageMetadata: () => ({ custom: { sources } }) })`. Configured strict mock model LanguageModelV4 usage metrics and tool call simulation to match AI SDK v7 spec.
- **What's next**: Phase 3 - Chat UI (assistant-ui modal integration, custom tool cards for PDF/Video/unavailable states, source chips, and assignment prompt suggestions).

### How it works
1. Incoming user questions hit `prepare(messages)`: conversation history is capped to the last 12 messages and augmented for follow-ups when queries are short (<6 words).
2. BM25 algorithm scores markdown chunks against query terms with stopword removal and returns the top 4 chunks.
3. Media intent detector scans for brochure/video keywords via word-boundary regexes and conditionally mounts `getBrochure` and `getVideo` tools with required toolChoice.
4. The system prompt is constructed containing strictly the retrieved chunks in a `## SOURCES` block and enforcing grounded refusal rules.
5. In chat mode, `streamText` and `toUIMessageStream` stream tokens and tool calls with attached source metadata; in knowledge test mode, `generateText` executes the same pipeline and returns the full audit trace.
6. When `MOCK_MODE=true` or API key is absent, `createMockModel` provides deterministic offline answers and tool invocations directly from the sources block.
