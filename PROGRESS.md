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

## Phase 3: Assistant-UI Chat Modal, Tool Cards & Grounded Chatbot
- **Done**: Built floating `ChatModal` with accessible launcher button, escape key listener, focus restoration, and `#chat-assistant` link triggers. Implemented custom media components (`PdfCard`, `VideoCard`, `UnavailableCard`, `ToolSkeleton`), safe markdown rendering with link allowlisting, and dynamic source chips from message metadata. Registered `getBrochure` and `getVideo` tools with `defineToolkit` and wired `useChatRuntime` to `/api/chat` with dynamic mode detection ("Live: <model>" or "Mock mode").
- **Decisions**: Passed toolkit to `AuiConfig` and `AssistantRuntimeProvider`. Sourced header logo from `public/logo.png`. Supported retry logic via `useMessageReload` and `useMessageError`.
- **What's next**: Phase 4 - Knowledge View (`/knowledge` route and `TestPanel` running the live backend pipeline and displaying audit traces).

### How it works
1. `ChatModal` floats in the lower-right corner and opens via the trigger button or `#chat-assistant` anchor links across the hero and navbar.
2. Empty chat state displays 4 assignment prompt suggestions that dispatch queries with a single click.
3. `useChatRuntime` streams assistant messages from `/api/chat`, receiving both markdown text and custom tool call parts.
4. When `getBrochure` executes, `PdfCard` renders the title, description, "Demo material" badge, and Open/Download buttons.
5. When `getVideo` executes, `VideoCard` mounts an HTML5 video player with fallback error handling and origin attribution.
6. Server-sent source metadata is retrieved via `useAuiState` and rendered as clickable source chips directly below the assistant message.

## Phase 4: Read-Only Knowledge View & Pipeline Test Panel
- **Done**: Created server-rendered `/knowledge` route displaying 7 verified knowledge sources with captured dates, chunk counts, and collapsible full text views. Displayed media registry with demo/real badges and URLs. Built client `TestPanel` with 300-char input, prompt suggestion chips, loading and error states, execution metadata (mode, model, latency), matched keyword badges, BM25 chunk scoring cards, selected media output, and full prompt snippet in a `<pre>` block.
- **Decisions**: Marked `/knowledge` as `force-dynamic` to read fresh disk sources on request. Maintained isolation by displaying only the single on-demand test execution trace with zero persistent storage of chats.
- **What's next**: Phase 5 - Polish, Accessibility audit, README documentation, Vercel deployment checklist, and Git commits.

### How it works
1. The `/knowledge` page executes server-side, reading local markdown snapshots from `data/sources/` and media items from `data/media.json`.
2. Each source displays its YAML frontmatter capture date, URL, chunk count, and complete text in a collapsible `<details>` element.
3. The interactive `TestPanel` component submits queries directly to `POST /api/knowledge/test` with 300-character validation.
4. The backend runs the exact same BM25 retrieval and preparation pipeline as live chat, returning the trace without storing anything.
5. `TestPanel` visualizes the ranked chunk scores, matched intent rule keywords, and selected PDF/video or "none".
6. The exact prompt string sent to the language model is exposed inside an inspectable `<pre>` container.

## Phase 5: Polish, Accessibility Audit, Documentation & Vercel Checklist
- **Done**: Audited keyboard focus order, aria roles (`role="dialog"`, `aria-live="polite"`), color contrast ratios, reduced motion styles, and responsive 360px viewport behavior. Verified zero forbidden words and eliminated em dashes. Wrote complete `README.md` covering setup, architecture flow diagram, verification steps, limitations, design decisions, and credits. Committed `.env.example` with clean template variables.
- **Decisions**: Verified strict `.gitignore` isolation preventing secret leaks (`git check-ignore .env.local` passing).
- **What's next**: Push commits to GitHub repository `https://github.com/Saparajeeta/GreedyAdventures_p`.

### How it works
1. Accessibility is validated across keyboard navigation: skip link targets `#main-content`, and focus returns to the launcher button on modal exit.
2. The UI conforms to high-contrast WCAG AA standards with custom brand palette `#12313f` and slate accents.
3. Chat stream text is announced politely to screen readers without disruptive layout shifts.
4. Production build runs typecheck and linting on every commit, ensuring clean zero-error outputs.
5. All environment variables are read server-side only and never exposed in client bundles.
6. The Vercel deployment workflow verifies build artifacts, routes, and environment variable bindings.

---

## Vercel Deployment Checklist

- [ ] **Repository Linking**: Connect GitHub repo `https://github.com/Saparajeeta/GreedyAdventures_p` to a new Vercel project.
- [ ] **Framework Preset**: Verify Framework Preset is set to `Next.js`.
- [ ] **Root Directory**: Confirm root directory is `./` (default).
- [ ] **Build Command**: `next build` (or `npm run build`).
- [ ] **Output Directory**: `.next` (default).
- [ ] **Environment Variables**:
  - `GOOGLE_GENERATIVE_AI_API_KEY`: Set your production Google Gemini API key (optional for live mode; if omitted, the app operates in offline mock mode).
  - `GEMINI_MODEL`: `gemini-2.0-flash` (default).
  - `MOCK_MODE`: `false` (or `true` to force mock mode).
- [ ] **Route Handler Max Duration**: Ensure plan supports `maxDuration = 30` (included in `/api/chat/route.ts`).
- [ ] **Images Remote Patterns**: Verify `next.config.ts` has remote patterns for `greedyadventures.com` and `pub-89f493a2b50b4e43b99552a737bef138.r2.dev`.
- [ ] **Post-Deploy Smoke Test**:
  1. Open production deployment URL and verify hero and package cards render correctly.
  2. Click "Ask our assistant" button and confirm floating chat modal opens.
  3. Send test prompt "What is included in the packages?" and verify text response and source chips.
  4. Send "Send me a brochure" and verify PDF card displays with working Open and Download buttons.
  5. Send "Can I see a video of the jump?" and verify HTML5 video player loads.
  6. Navigate to `/knowledge` and confirm 7 verified sources are listed.
  7. Run a query in the `/knowledge` Test Panel and verify trace metadata, BM25 scores, and context display.
