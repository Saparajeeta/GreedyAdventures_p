# Sea View Skydiving Prototype

A Next.js prototype for the Greedy Adventures "Sea View Skydiving" experience in Pattaya, Thailand. It combines an editorial landing page, an AI chat assistant built with assistant-ui and AI SDK v7, and a plain-language knowledge inspector.

## Features

- **Experience Page (`/`)**: Built with Next.js 15 App Router and Tailwind CSS. Includes package comparison (ECO, DELUXE, VIP), selection panel, 5-step jump timeline, dropzone location card with Google Maps link, and accessible markup.
- **Chat Assistant**: Floating chat modal using assistant-ui. Answers questions strictly from static website snapshots, displays clickable source citations, and provides natural replies for greetings and off-topic requests.
- **Media Delivery**: PDF brochure cards and HTML5 jump video players delivered directly via server intent rules without model tool calls. Pure media requests skip the language model entirely.
- **Provider Failover**: Tries Google Gemini first (default), then automatically fails over to Groq if the primary provider hits a quota limit, error, or 12-second timeout. If both providers fail, streams an extractive fallback answer with a polite busy notice.
- **Knowledge View (`/knowledge`)**: Non-technical dashboard showing loaded website pages, shareable files, and a test query panel that runs the real retrieval pipeline without persisting chat history.

---

## Setup and Installation

### Prerequisites

- Node.js 18.17+ or 20+
- npm or pnpm

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Saparajeeta/GreedyAdventures_p.git
cd GreedyAdventures_p
npm install
```

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Google Gemini API key. If unset, the app runs in deterministic mock mode.
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Groq API key for backup failover (optional).
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Primary provider: google or groq (default: google)
LLM_PRIMARY=google

# Force mock mode even if keys are present: true | false
MOCK_MODE=false
```

### 3. Run Development Server

```bash
npm run dev
```

- Main experience page: [http://localhost:3000](http://localhost:3000)
- Knowledge view: [http://localhost:3000/knowledge](http://localhost:3000/knowledge)

### 4. Run Automated Tests

The Vitest test suite runs offline with zero external network calls:

```bash
npm test
```

### 5. Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | `""` | Gemini API key. If unset, defaults to deterministic mock mode. |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Model identifier passed to `@ai-sdk/google`. |
| `GROQ_API_KEY` | No | `""` | Groq API key. Used as backup or primary based on `LLM_PRIMARY`. |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Model identifier passed to `@ai-sdk/groq`. |
| `LLM_PRIMARY` | No | `google` | Which provider to attempt first (`google` or `groq`). |
| `MOCK_MODE` | No | `false` | When `true`, forces offline deterministic mock mode. |

---

## Knowledge Sources

All facts usable by the assistant come from static markdown snapshots in `data/sources/`:

1. `home.md`: Company background and adventure overview.
2. `sea-view-skydiving.md`: Jump altitude (13,000 ft), freefall (~60s), canopy flight (5-7 min), duration (~3h), package inclusions, and pricing.
3. `mount-abu-skydiving.md`: Mount Abu tandem jump options in Rajasthan (₹29,999 and ₹39,999).
4. `pattaya-escape.md`: Pattaya location details and regional guide.
5. `cancellations.md`: Weather policies, free cancellation up to 48 hours, and reschedule rules.
6. `contact.md`: Dropzone address in Klaeng District, Rayong, phone (+91 95357 68554), WhatsApp, and 100 kg weight limit.
7. `about.md`: Safety philosophy and equipment standards.

No live web scraping occurs at runtime. If a detail is missing from these pages (such as dropzone parking), the assistant states that it does not have that detail on the website pages and provides contact options.

---

## Architecture Flow

```
[User Request]
       |
       v
[prepare(messages)]
       |-- History capped to last 6 messages
       |-- Short query expansion (<6 words appends previous user query)
       |
       +---> [Intent Detection (Regex)]
       |          |-- Word-boundary matches: brochure, video
       |          v
       |     Direct server stream parts for PdfCard / VideoCard
       |     (Pure media requests skip the model call entirely)
       |
       +---> [BM25 Retrieval]
                  |-- Heading-based chunking (<=1000 chars)
                  |-- Stopword filtering and location tagging
                  |-- Returns top 5 passages (~3,500 chars max)
       |
       v
[System Prompt Assembly]
       |-- Location rules (Pattaya default, Mount Abu only when named)
       |-- Refusal on missing facts, redirect on unrelated topics
       |-- Grounding via ## SOURCES block
       |
       v
[Model Call (1 call per message, maxRetries: 0, maxOutputTokens: 600)]
       |-- Try primary provider (Google or Groq, 12s timeout)
       |-- On error/timeout: try backup provider
       |-- If both fail or mock mode: extractive fallback with muted notice
       |
       v
[Streaming Response]
       |-- Text stream with markdown rendering
       |-- Server media cards prepended when requested
       |-- Clickable source citation chips
```

---

## Knowledge View (`/knowledge`)

The knowledge view explains what the assistant knows in plain words:
1. Access directly at `/knowledge` or click "Knowledge view" in the footer or chat modal header.
2. Lists all 7 website sources with date saved, link, and expandable full text.
3. Lists shareable files (PDF brochure marked demo, jump video from greedyadventures.com).
4. Includes an interactive "Try a question" panel that executes the real retrieval pipeline and displays the answer, closest source passages, and technical audit metrics.

---

## Verification Scenarios

1. **Package Inclusions**: Ask "What is included in the DELUXE package?"
   - Answers: 13,000 ft jump, safety briefing, instructor, certificate, plus wrist-mounted Handycam 4K video and photos (฿12,500). Includes source link chips.
2. **Media Requests**:
   - Ask "Send me a brochure": Emits the PDF card with Open and Download actions without calling the language model.
   - Ask "Can I see a video?": Emits the HTML5 video player card without calling the language model.
   - Ask "Send me the brochure and a video": Emits both cards without calling the language model.
3. **Weight Limits**: Ask "What is the weight limit for a tandem jump?"
   - Answers: 100 kg, age 18 or older with valid ID, weight proportional to height.
4. **Missing Details**: Ask "Is parking available at the dropzone?"
   - Answers: Confirms the detail is not on the website pages and provides phone and WhatsApp contact info.
5. **Off-Topic Queries**: Ask "Write me a python script"
   - Answers: Politeness redirect stating this is outside what the assistant can help with and lists skydiving topics it supports.
6. **Provider Failover**:
   - If the primary provider quota is exhausted or times out after 12 seconds, the secondary provider answers automatically.
   - If all providers are unavailable, the assistant returns an extractive answer from the retrieved passages followed by: "Shown from the website text because the AI service is busy. Please try again in a minute."

---

## Automated Tests

Run the Vitest suite:

```bash
npm test
```

132 tests pass offline across 12 test files:
- `tests/intent.test.ts` and `tests/media-intent.test.ts`: Intent keywords, pure media detection, and false-positive guards.
- `tests/retrieval.test.ts` and `tests/retrieval-cases.test.ts`: BM25 ranking, query expansion, location labels, and 18 benchmark question retrieval.
- `tests/benchmarks-eval.test.ts`: End-to-end evaluation across 18 benchmark inquiries.
- `tests/failover.test.ts`: Provider candidate ordering and fallback execution.
- `tests/failure.test.ts`: Error classification and fallback wrapping.
- `tests/chat-behavior.test.ts`: Greetings, conversational tone, and off-topic redirection.
- `tests/registry.test.ts`: Media registry lookups and URL safety.
- `tests/schemas.test.ts`: Zod schema validation for chat and test endpoints.
- `tests/pipeline.test.ts`: Pipeline preparation and mock execution.

---

## Limitations

- **Static Snapshot**: Knowledge is drawn from static files and does not automatically track live changes on greedyadventures.com.
- **No Booking Checkout**: Prototype displays packages and pricing but does not process payments or book jump slots.
- **Media Scope**: Media delivery is limited to the registered demo PDF brochure and jump video.

---

## Credits

- **assistant-ui**: MIT License. Copyright (c) 2024 assistant-ui contributors.
- **Brand Assets**: Content, dropzone photos, and video belong to [Greedy Adventures](https://www.greedyadventures.com/) and are used for evaluation purposes.
