# Sea View Skydiving Prototype

A Next.js prototype for the Greedy Adventures "Sea View Skydiving" experience in Pattaya, Thailand. It combines a redesigned editorial experience page, an AI chatbot built with assistant-ui grounded in verified website snapshots, and a read-only knowledge base inspector.

## Features

- **Experience Page (`/`)**: Redesigned page built with Next.js App Router, Tailwind CSS, Playfair Display, and Inter. Includes package comparison (Eco, Deluxe, VIP), the 5-step plan timeline, jump highlights, and accessible semantic markup.
- **Grounded Assistant**: Floating chat modal powered by assistant-ui and Vercel AI SDK v7. Answers strictly from static knowledge snapshots, calls server tools for media, displays clickable source chips, and falls back gracefully when information is unavailable.
- **Auditable Media Tools**: Serves jump video players from official media URLs and generated PDF brochures with Open and Download actions.
- **Knowledge View (`/knowledge`)**: Read-only dashboard displaying loaded source files, chunk statistics, allowed media items, and an interactive test panel exposing exact retrieved BM25 chunks and model prompts.

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

Edit `.env.local` with your configuration:

```env
# Optional: Google Gemini API key. If omitted, the app runs in deterministic mock mode.
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Model identifier (default: gemini-3.8-flash)
GEMINI_MODEL=gemini-3.8-flash

# Force mock mode even if an API key is present: true | false
MOCK_MODE=false
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience page and chat modal.
Open [http://localhost:3000/knowledge](http://localhost:3000/knowledge) to inspect the knowledge base and test retrieval.

### 4. Run Automated Tests

The test suite runs with Vitest and requires zero network access:

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
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | `""` | Gemini API key. If unset or empty, the app defaults to deterministic mock mode. |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | The Gemini model name passed to `@ai-sdk/google`. |
| `MOCK_MODE` | No | `false` | When set to `true`, forces the offline mock model regardless of API key presence. |

---

## Sources and Data Snapshots

All knowledge usable by the chatbot comes from static markdown snapshots captured once from live pages on greedyadventures.com. The snapshots are located in `data/sources/`:

1. `home.md` - Main homepage overview and company story.
2. `sea-view-skydiving.md` - Primary experience source: jump altitude (13,000 ft), freefall time (~60s), canopy flight (5-7 min), duration (~3h), package inclusions, and add-ons.
3. `mount-abu-tandem-skydiving.md` - Mount Abu experience details in Rajasthan.
4. `pattaya.md` - Pattaya regional destination guide.
5. `cancellations.md` - Weather delay policies, rescheduling terms, and refund guidelines.
6. `contact.md` - Official phone (+91 95357 68554), WhatsApp contact, and dropzone location.
7. `about.md` - Company background and safety philosophy.

Runtime web crawling is disabled. If a fact is absent from these sources (such as dropzone parking availability), the assistant explicitly states that the detail is not listed and directs users to contact the crew.

---

## Agent Pipeline Flow

```
[User Request]
       |
       v
[prepare(messages)]
       |-- History capped to last 12 messages
       |-- Short query expansion (<6 words appends previous user query)
       |
       +---> [Intent Detection]
       |          |-- Word-boundary regex matching: brochure, video
       |          v
       |     Active Tools (getBrochure, getVideo)
       |
       +---> [BM25 Retrieval]
                  |-- Heading-based chunking (<=800 chars)
                  |-- Stopword filtering and scoring (k1=1.2, b=0.75)
                  v
             Top 4 Ranked Chunks
       |
       v
[System Prompt Assembly]
       |-- Injects strict refusal instructions
       |-- Appends ## SOURCES block with retrieved chunks
       |
       v
[Model Execution]
       |-- If MOCK_MODE or no API key -> Deterministic Mock Model
       |-- If Live Key -> Google Gemini (configurable, default gemini-3.8-flash)
       |
       v
[Response Stream]
       |-- Text stream with markdown rendering
       |-- Server tool invocations (getBrochure / getVideo)
       |-- Per-message source metadata chips
```

---

## How to Open the Knowledge View

The read-only knowledge dashboard can be accessed in two ways:
1. Direct URL: Navigate to `/knowledge` in your browser.
2. From the Page: Click the "Knowledge View" link located in the top navigation bar, the experience footer, or the chat modal header.

---

## Verification Steps

### 1. General Questions
- **Query**: "What is included in the DELUXE package?"
- **Expected Outcome**: The assistant lists the tandem jump from 13,000 ft, instructor briefing, gear, certificate, and wrist-mounted video with photos. Source chips appear below the answer linking to the Sea View Skydiving page.

### 2. Follow-Up Queries
- **Step 1**: Ask "How high is the jump?" (Assistant answers 13,000 ft).
- **Step 2**: Ask "How long is the freefall?" (Assistant answers approximately 60 seconds).
- **Expected Outcome**: The assistant maintains conversational context across consecutive turns.

### 3. PDF Brochure Request
- **Query**: "Send me a brochure"
- **Expected Outcome**: The assistant triggers the `getBrochure` tool and renders a PDF card with title, description, "Demo material" badge, and functional "Open" and "Download" buttons.

### 4. Jump Video Request
- **Query**: "Can I see a video of the jump?"
- **Expected Outcome**: The assistant triggers the `getVideo` tool and renders an HTML5 video player streaming the official jump video. If the player cannot decode the file, an error fallback link directs to greedyadventures.com.

### 5. Combined Request
- **Query**: "Send me a brochure and a video"
- **Expected Outcome**: Both `getBrochure` and `getVideo` tools are executed, rendering the brochure card and video player in the same response.

### 6. Missing Information Handling
- **Query**: "Is parking available at the dropzone?"
- **Expected Outcome**: The assistant confirms that parking information is not listed in the website sources and directs the user to contact the crew.

### 7. Weight and Age Limits
- **Query**: "What is the weight limit for a tandem jump?"
- **Expected Outcome**: The assistant answers from `contact.md` that the tandem skydiving weight limit is 100 kg (with valid ID, age 18 or older), noting weight must be proportional to height.

### 8. Failure Handling
- **Query**: Simulate rate limits or network errors.
- **Expected Outcome**: The chat surfaces a clear error notice with a functional "Retry" button.

---

## Repeatable Checks via Vitest

Run the automated test suite with:

```bash
npm test
```

The 55 tests cover:
- Intent detection keywords and false-positive guards (`tests/intent.test.ts`)
- BM25 retrieval ranking and short follow-up query expansion (`tests/retrieval.test.ts`)
- Media registry lookups and URL allowlist enforcement (`tests/registry.test.ts`)
- Zod request body validation (`tests/schemas.test.ts`)
- Mock model pipeline across the four assignment prompts (`tests/pipeline.test.ts`)
- Error fallbacks and empty retrieval handling

---

## Design Decisions Table

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Framework | Next.js App Router (15.5) | Server components for knowledge listings and streaming route handlers for AI chat. |
| AI Integration | AI SDK v7 + assistant-ui | Uses official UI primitives (`ThreadPrimitive`, `ComposerPrimitive`) with custom tool rendering. |
| Search Engine | In-Memory BM25 | Fast, zero external database dependency, and deterministic scoring. |
| Chunking Strategy | Heading-based split (<=800 chars) | Preserves semantic section titles and hierarchy from markdown files. |
| Media Delivery | Client-side Tool Cards | Displays interactive PDF and video components instead of raw URLs in text. |
| Fallback Mode | Deterministic Mock Model | Allows complete offline evaluation and continuous integration without API credentials. |
| Audit Storage | Ephemeral Per-Request Trace | Trace is returned only to the test caller. No global trace database is maintained. |

---

## Limitations

- **Static Snapshot**: Knowledge does not update automatically when the live website changes.
- **No Booking Engine**: The prototype does not take bookings, collect payments, or reserve jump time slots.
- **No User Accounts**: Conversations are stored locally in client runtime state and reset on page reload.
- **Tool Count**: Server tools are limited to `getBrochure` and `getVideo`.

---

## AI Assistance Disclosure

This prototype was developed with the assistance of Google Antigravity and Gemini. Development was structured through:
- `AGENTS.md`: Defines strict project rules, architectural constraints, forbidden vocabulary, and verified stack facts.
- `PROGRESS.md`: Serves as an incremental phase log recording architectural decisions, test results, and operational checklists after each milestone.

---

## Credits and Licenses

- **assistant-ui**: MIT License. Copyright (c) 2024 assistant-ui contributors.
- **Brand Assets and Content**: Text copy, dropzone images, video footage, and brand marks belong to [Greedy Adventures](https://www.greedyadventures.com/) and are referenced solely for evaluation purposes.
