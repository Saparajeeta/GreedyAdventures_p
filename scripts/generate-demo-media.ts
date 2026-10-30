import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

async function generateDemoBrochure() {
  const publicDir = path.join(process.cwd(), "public", "media");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background header band (#12313f)
  page.drawRectangle({
    x: 0,
    y: 720,
    width: 595.28,
    height: 122,
    color: rgb(0.07, 0.19, 0.25), // #12313f
  });

  // Demo Material Badge
  page.drawRectangle({
    x: 40,
    y: 802,
    width: 110,
    height: 18,
    color: rgb(0.85, 0.45, 0.15), // Warm amber accent
  });
  page.drawText("DEMO MATERIAL", {
    x: 48,
    y: 807,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Header Title
  page.drawText("SEA VIEW SKYDIVING", {
    x: 40,
    y: 765,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Tandem Jump over Pattaya, Thailand | Greedy Adventures", {
    x: 40,
    y: 742,
    size: 11,
    font: fontRegular,
    color: rgb(0.8, 0.9, 0.95),
  });

  // Body Sections
  let currentY = 690;

  function drawSection(heading: string, lines: string[]) {
    page.drawText(heading, {
      x: 40,
      y: currentY,
      size: 13,
      font: fontBold,
      color: rgb(0.07, 0.19, 0.25),
    });
    currentY -= 17;

    for (const line of lines) {
      page.drawText(line, {
        x: 40,
        y: currentY,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      currentY -= 14;
    }
    currentY -= 10;
  }

  drawSection("EXPERIENCE HIGHLIGHTS", [
    "- Exit altitude: 13,000 ft with the Gulf of Thailand on the horizon.",
    "- Around sixty seconds of freefall, then five to seven minutes under canopy along the coast.",
    "- No experience needed: USPA-certified instructor flies the jump.",
    "- Total time at the dropzone: approximately 3 hours.",
    "- Same aircraft, altitude and instructors in every package.",
  ]);

  drawSection("PACKAGES & PRICING", [
    "- ECO (THB 9,500 per person): The jump, nothing else. No camera.",
    "- DELUXE (THB 12,500 per person): Video and photos included (handycam).",
    "- VIP (THB 14,000 per person): Personal cameraman and edited film (full media coverage).",
    "All packages include: Tandem skydive experience in Pattaya, Thailand, safety briefing &",
    "instructor support, aircraft ascent & ocean views, and certificate of completion.",
  ]);

  drawSection("THE 5-STEP PLAN", [
    "Step 1: Arrival and check-in - Sign in at the dropzone and bring your photo ID.",
    "Step 2: Safety briefing and gear fitting - Meet your instructor for briefing and harness fitting.",
    "Step 3: Boarding and the climb - Board the aircraft and climb to jump altitude.",
    "Step 4: Exit and freefall - Exit with your instructor for freefall over the Gulf of Thailand.",
    "Step 5: Canopy flight and landing - Fly under the parachute and land back at the dropzone.",
  ]);

  drawSection("LOCATION & GOOD TO KNOW", [
    "- Location: Pattaya Sea View, 95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand.",
    "- Operated by: Dropzone Thailand.",
    "- Bangkok pickup is available as a fixed-price add-on.",
  ]);

  // Footer
  page.drawRectangle({
    x: 40,
    y: 50,
    width: 515.28,
    height: 1,
    color: rgb(0.85, 0.88, 0.92),
  });
  page.drawText("Demo material compiled from greedyadventures.com/experiences/sea-view-skydiving for take-home prototype.", {
    x: 40,
    y: 35,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(publicDir, "sea-view-skydiving-brochure.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`Generated demo brochure PDF at ${filePath}`);
}

generateDemoBrochure().catch((err) => {
  console.error("Error generating demo brochure:", err);
  process.exit(1);
});
