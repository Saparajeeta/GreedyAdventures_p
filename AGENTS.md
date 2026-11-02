# Sea View Skydiving Project Notes

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- assistant-ui + AI SDK v7 (`ai`, `@assistant-ui/react`, `@assistant-ui/ai-sdk`, `@ai-sdk/react`)
- Providers: `@ai-sdk/google` (default primary), `@ai-sdk/groq` (default backup)
- Testing: Vitest (`npm test`, offline without network)

## Structure
- `data/sources/*.md`: static markdown snapshots of Greedy Adventures pages with YAML frontmatter.
- `data/media.json`: registered media items (demo PDF brochure, jump video).
- `src/lib/knowledge/`: source loader, heading-based chunker (<=1000 chars), BM25 retrieval.
- `src/lib/media/`: regex intent detection (`intent.ts`) and registry lookup (`registry.ts`).
- `src/lib/chat/model.ts`: provider failover wrapper (Google / Groq) with 12s timeout and mock fallback.
- `src/lib/chat/pipeline.ts`: history cap (last 6), retrieval query builder, top 5 passages (~3,500 chars), system prompt assembly.
- `src/app/api/chat/route.ts`: chat streaming endpoint.
- `src/app/api/knowledge/test/route.ts`: single-run test trace endpoint.
- `src/app/knowledge/page.tsx`: plain-language knowledge inspector for visitors.

## Core Rules
- Single model call per message: no model tool calling or multi-step loops. Set maxRetries to 0 and maxOutputTokens to 600.
- Media from server rules: brochure and video requests are matched by intent rules and injected directly into the UI stream as tool parts for PdfCard and VideoCard. Pure media requests skip the model entirely.
- Provider failover: tries primary provider (set by `LLM_PRIMARY`, default google), then backup (groq). If both fail, returns an extractive answer from retrieved passages with a muted busy notice.
- Grounding: answer strictly from SOURCES. Treat questions as about Pattaya unless Mount Abu or India is named. Missing details say "I don't have that detail on the website pages I can see" plus contact info. Unrelated questions get a polite redirect. Never invent facts.
- No global trace storage: test traces are returned only to the caller; visitor chats are never stored.
- Never log, expose, or commit API keys.
