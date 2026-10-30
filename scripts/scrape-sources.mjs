import * as fs from "fs";
import * as path from "path";

const urls = [
  { id: "home", url: "https://www.greedyadventures.com/", title: "Greedy Adventures - Home" },
  { id: "sea-view-skydiving", url: "https://www.greedyadventures.com/experiences/sea-view-skydiving", title: "Sea View Skydiving: Tandem jump over Pattaya" },
  { id: "mount-abu-skydiving", url: "https://www.greedyadventures.com/experiences/mount-abu-tandem-skydiving", title: "Mount Abu Tandem Skydiving" },
  { id: "pattaya-escape", url: "https://www.greedyadventures.com/escapes/thailand/pattaya", title: "Pattaya Adventure Escape" },
  { id: "cancellations", url: "https://www.greedyadventures.com/cancellations", title: "Cancellation & Refund Policy" },
  { id: "contact", url: "https://www.greedyadventures.com/contact", title: "Contact Us - Greedy Adventures" },
  { id: "about", url: "https://www.greedyadventures.com/about", title: "About Us - Greedy Adventures" },
];

function cleanHtmlToText(html) {
  // Extract title if present
  let titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

  // Remove scripts, styles, svg, noscript, nav, header if needed or keep clean body
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");

  // Convert headings and paragraphs into newlines
  text = text
    .replace(/<\/(h[1-6]|p|div|section|article|li|tr)>/gi, "\n")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  // Decode basic HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&bull;/g, "•")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Clean extra whitespace and blank lines
  const lines = text
    .split("\n")
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(line => line.length > 0);

  return {
    pageTitle,
    text: lines.join("\n")
  };
}

async function scrapeAll() {
  const sourcesDir = path.join(process.cwd(), "data", "sources");
  if (!fs.existsSync(sourcesDir)) {
    fs.mkdirSync(sourcesDir, { recursive: true });
  }

  // Delete existing placeholder files
  const existingFiles = fs.readdirSync(sourcesDir);
  for (const f of existingFiles) {
    fs.unlinkSync(path.join(sourcesDir, f));
    console.log("Deleted old placeholder:", f);
  }

  const today = new Date().toISOString().split("T")[0];

  for (const item of urls) {
    console.log(`Fetching ${item.url}...`);
    const res = await fetch(item.url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    const html = await res.text();
    const { pageTitle, text } = cleanHtmlToText(html);

    // Also look for images on sea-view-skydiving
    if (item.id === "sea-view-skydiving") {
      const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
      console.log("Found images on sea-view-skydiving:", imgMatches);
      fs.writeFileSync("scripts/sea-view.html", html);
    }

    const titleToUse = pageTitle || item.title;
    const content = `---
title: "${titleToUse.replace(/"/g, '\\"')}"
url: "${item.url}"
capturedAt: "${today}"
---

${text}
`;

    const outPath = path.join(sourcesDir, `${item.id}.md`);
    fs.writeFileSync(outPath, content, "utf-8");
    console.log(`Saved ${outPath} (${text.length} chars)`);
  }
}

scrapeAll().catch(console.error);
