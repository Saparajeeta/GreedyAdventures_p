import { loadSources } from "./loader";
import { chunkAllSources, type Chunk } from "./chunker";

// English stopwords for BM25
const STOPWORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any",
  "are","as","at","be","because","been","before","being","below","between",
  "both","but","by","can","did","do","does","doing","down","during","each",
  "few","for","from","get","had","has","have","having","he","her","here",
  "him","his","how","i","if","in","into","is","it","its","itself","just",
  "me","more","most","my","no","nor","not","now","of","off","on","once",
  "only","or","other","our","out","over","own","same","she","should","so",
  "some","such","than","that","the","their","them","then","there","these",
  "they","this","those","through","to","too","under","until","up","us","was",
  "we","were","what","when","where","which","while","who","whom","why","will",
  "with","would","you","your",
]);

// BM25 params
const K1 = 1.2;
const B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface IndexedChunk {
  chunk: Chunk;
  tf: Map<string, number>;
  length: number;
}

let _indexed: IndexedChunk[] | null = null;
let _idf: Map<string, number> | null = null;
let _avgLen = 0;

function buildIndex() {
  if (_indexed) return;
  const sources = loadSources();
  const chunks = chunkAllSources(sources);

  _indexed = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text + " " + chunk.heading);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { chunk, tf, length: tokens.length };
  });

  _avgLen =
    _indexed.length === 0
      ? 0
      : _indexed.reduce((s, c) => s + c.length, 0) / _indexed.length;

  // IDF: log((N - df + 0.5) / (df + 0.5) + 1)
  const df = new Map<string, number>();
  for (const { tf } of _indexed) {
    for (const term of tf.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  const N = _indexed.length;
  _idf = new Map<string, number>();
  for (const [term, freq] of df) {
    _idf.set(term, Math.log((N - freq + 0.5) / (freq + 0.5) + 1));
  }
}

export interface RetrievedChunk {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  heading: string;
  text: string;
  score: number;
}

export function retrieve(query: string, k = 4): RetrievedChunk[] {
  buildIndex();
  const indexed = _indexed!;
  const idf = _idf!;
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0 || indexed.length === 0) return [];

  const scores: { chunk: Chunk; score: number }[] = indexed.map(
    ({ chunk, tf, length }) => {
      let score = 0;
      for (const term of queryTokens) {
        const termIdf = idf.get(term) ?? 0;
        const freq = tf.get(term) ?? 0;
        const norm = freq * (K1 + 1);
        const denom = freq + K1 * (1 - B + B * (length / (_avgLen || 1)));
        score += termIdf * (norm / denom);
      }
      return { chunk, score };
    }
  );

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ chunk, score }) => ({
      sourceId: chunk.sourceId,
      sourceTitle: chunk.sourceTitle,
      sourceUrl: chunk.sourceUrl,
      heading: chunk.heading,
      text: chunk.text,
      score,
    }));
}

/** Reset index cache (for tests). */
export function resetIndex(): void {
  _indexed = null;
  _idf = null;
  _avgLen = 0;
}
