# PROJECT: Greedy Adventures take-home (Sea View Skydiving page + assistant-ui chatbot + knowledge view)

PHASE 1 IS DONE (page UI, data/sources/*.md, data/media.json, demo brochure, vitest, build). Do not redo it or change its design.

## Efficiency rules (limited quota)
- Be concise. No tutorials, no restating requests, no exploratory browsing except the doc URLs listed below.
- Edit files in place. Never reprint unchanged files.
- Work ONLY on the phase I name. Run typecheck/tests/build once per phase, fix, stop.
- Reuse existing Phase 1 code (loaders, schemas, registry) instead of rewriting it.
- Smallest code that works. No dead code, no speculative abstractions.
- End of each phase: append 5 lines to PROGRESS.md (done, decisions, next) plus a 6-line "how it works" so I can explain it.
- Do not ask questions unless truly blocked. Pick sensible defaults, note them in PROGRESS.md.

## Verified stack facts (from assistant-ui docs, Oct 2026). Follow these, not memory.
- New projects target AI SDK v7. Packages: @assistant-ui/react @assistant-ui/ai-sdk ai@^7 @ai-sdk/react@^4 zod, plus @ai-sdk/google (check `npm view @ai-sdk/google peerDependencies` and install the version that supports ai@7). Do NOT use @assistant-ui/react-ai-sdk (legacy).
- Client: useChatRuntime from @assistant-ui/ai-sdk, AssistantRuntimeProvider from @assistant-ui/react. Default endpoint is /api/chat. UI source is added by the CLI (`npx assistant-ui init`; run it after I have committed; never let it overwrite my Phase 1 page, layout or globals).
- Route handler: streamText({ abortSignal: req.signal, model, messages: await convertToModelMessages(messages, { tools }), tools }); return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) }). convertToModelMessages is ASYNC in v7. Multi-step tool use needs stopWhen: stepCountIs(n). export const maxDuration = 30.
- Tool UI: defineToolkit({ toolName: { type: "backend", render: ({ args, result, status }) => ... } }), registered with AuiConfig({ tools: Tools({ toolkit }) }) passed as `config` to AssistantRuntimeProvider. Handle status running, incomplete (error) and complete.
- Per-message server data (sources) can be sent with messageMetadata in toUIMessageStream; on the client it arrives under message.metadata.custom.
- Docs (read only if unsure): https://www.assistant-ui.com/docs/runtimes/ai-sdk/v7 , https://www.assistant-ui.com/docs/tools/tool-ui , https://www.assistant-ui.com/docs/tools/backend , https://www.assistant-ui.com/llms.txt , and examples/with-ai-sdk-v7 in github.com/assistant-ui/assistant-ui. If installed types differ from this section, trust the installed types and note it in PROGRESS.md.

## Architecture (one pipeline, thin routes)
- src/lib/knowledge: loadSources() (reuse Phase 1 loader), chunk by markdown heading (<= ~800 chars, keep source title/url/heading), retrieve(query, k=4) using BM25 (k1 1.2, b 0.75, lowercase, stopwords removed). Returns chunks with scores.
- src/lib/media/intent.ts: detectMediaIntent(text) -> { brochure, video, matched: string[] }. Table-driven, word-boundary regexes (brochure|pdf|flyer|leaflet ; video|footage|clip|watch). "both" = both flags. Conservative: no false positives on plain questions.
- src/lib/media/registry.ts: reads data/media.json (zod), selectMedia(type) -> item or null, URL allowlist (own /media paths + hosts used in media.json).
- src/lib/chat/tools.ts: server tools getBrochure and getVideo (empty input schema). execute returns { available: true, item } or { available: false, reason }.
- src/lib/chat/model.ts: the ONLY provider file. getModel(): mock model if MOCK_MODE=true or no API key, else google(process.env.GEMINI_MODEL).
- src/lib/chat/mock-model.ts: a deterministic fake language model that implements the AI SDK model interface (use the mock helpers from "ai/test" if the installed version has them), answers from the provided SOURCES block, and calls only the tools it is allowed. Mock mode must run the SAME pipeline.
- src/lib/chat/pipeline.ts: prepare(messages): cap history to last 12 messages; retrievalQuery = last user message, plus the previous user message when the last is under 6 words; retrieve; detect intent; activeTools = only tools matching intent (none if no intent, and omit tools entirely); toolChoice required when intent exists; build system prompt with an exact SOURCES block; return { system, tools, chunks, intent, contextSentToModel }. run() uses streamText for chat and generateText for the knowledge test, both through prepare().
- System prompt rules: answer ONLY from SOURCES; if nothing relevant say so plainly and point to contacting Greedy Adventures using contact details found in sources; never invent prices, limits, dates or policies; concise; for media requests call the tool then add one short sentence; if a tool returns unavailable say so; do not paste file URLs (the card shows them).
- src/lib/schemas.ts: zod for chat body (max 40 messages, each user text max 1000 chars) and test body (question max 300 chars).
- src/app/api/chat/route.ts and src/app/api/knowledge/test/route.ts: thin. Validate, call pipeline, catch model errors and return a friendly error (rate limit, timeout, generic). Never log or return secrets.
- NO global trace store. The trace is built per request and returned to the caller only: { question, retrievalQuery, chunks (title, url, heading, score, text), contextSentToModel, intent.matched, mediaSelected, mode, modelId, latencyMs, answer }. The /knowledge page must never show other visitors' questions.
- Sources for the chat: send retrieved sources (title, url) via messageMetadata; render them as source chips under assistant messages.

## UI requirements (chat)
- assistant-ui Thread inside a floating assistant modal/popover (use the CLI's assistant-modal component if available, else Radix Popover). Keyboard accessible: open button labelled, Esc closes, focus returns to the button, visible focus rings, aria-live for streaming, prefers-reduced-motion respected, responsive down to 360px.
- Header: logo, title, mode badge ("Live: <model>" or "Mock mode"), link to /knowledge.
- Welcome suggestions: the four assignment prompts as buttons.
- PdfCard: title, description, "Demo material" badge when isDemo, Open (new tab, rel noopener noreferrer) and Download buttons.
- VideoCard: <video controls preload="metadata" playsInline>, onError falls back to a clearly labelled link; badge "Demo material" or "From greedyadventures.com".
- Unavailable result: a plain card saying the file is not available. Tool status running: skeleton "Preparing...". Message errors: friendly text plus Retry button.
- Render markdown safely (assistant-ui default markdown, no dangerouslySetInnerHTML). Only allow links to hosts present in the sources.
- Sources for the chat: send retrieved sources (title, url) via messageMetadata; render them as source chips under assistant messages.

## Knowledge view (/knowledge)
- Server component lists sources (title, URL, capturedAt, chunk count, <details> with the full text the bot can use) and media (type, title, url, Demo/Real, description). Mode badge. Link back to the page.
- Client TestPanel: input (max 300), calls POST /api/knowledge/test, shows loading and error states, then: answer, mode/model/latency, matched rule keywords, each retrieved chunk with score, the exact contextSentToModel in a <pre>, and the selected PDF/video (or "none"). Note on page: "Runs the same pipeline as the chat. Shows only this test run; visitor chats are never stored or displayed."
- No editing, uploads, auth, secrets.

## Tests (vitest, `npm test`, no network)
- intent table (brochure, video, both, none, tricky phrasing, no false positive)
- retrieval (known questions return the expected source in top results; follow-up uses the previous question)
- registry (unavailable when missing; non-allowlisted URL rejected)
- schemas (empty, too long, too many messages)
- pipeline with mock model: the 4 assignment prompts give text-only / PDF / video / both
- failing model returns the friendly error path
- "no sources matched" produces the correct context string

## Stack
Next.js App Router, TypeScript strict, Tailwind, deploy target Vercel. Keys server-side only. .env.example committed with GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_MODEL, MOCK_MODE.

## Deliverables
Working app + README (setup, env vars, sources, agent flow diagram in text, how to open /knowledge, limitations, AI assistance disclosure, verification steps for answers/follow-ups/PDF/video/missing info/model failure, repeatable checks via npm test, design decisions table, credits: assistant-ui MIT, site content and logo belong to Greedy Adventures, used for this assignment only).
