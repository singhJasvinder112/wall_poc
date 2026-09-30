import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { wallAnalysisSchema } from "@/lib/wall-analysis-schema";
import { saveWallAnalysis } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { WALL_HANDOVER_SECTIONS } from "@/lib/wall-handover-checklist";
import { buildAqlPromptBlock } from "@/lib/aql-standards";

export const maxDuration = 60;

const MODEL = google("gemini-2.5-flash");
const MAX_INLINE_BYTES = 15 * 1024 * 1024;

const CAMERA_ITEMS = WALL_HANDOVER_SECTIONS.flatMap((section) =>
  section.items
    .filter((item) => item.evidence !== "manual")
    .map((item) => `  ${item.id} — ${section.title}: ${item.label}`),
).join("\n");

const CHECKLIST_INSTRUCTIONS = `
Also pre-fill the SOBHA paint/silicon handover checklist. Return "checklist"
as { itemId, status, remark }[].

Use ONLY these itemIds (camera-assessable):
${CAMERA_ITEMS}

Rules:
- Include an item ONLY if this media actually shows it.
- Default to "good" when the item is in frame and looks acceptable — do NOT mark
  "attention" for tiny / doubtful marks.
- status "attention" ONLY when a clear SAQL defect is visible; remark then required.
- "not_assessable" when in frame but truly cannot tell.
- NEVER claim feeler-gauge, German-scale, right-angle square, or paint-batch match readings.
- Omitting is correct. Do not invent checklist problems.`;

const RATE_CARD = `
COSTING — Dubai finish rectification rates in AED (indicative):
  Localised touch-up / sand & repaint (minor) ............. 150 - 400
  Paint crack / damage repair + repaint (moderate) ........ 300 - 800
  Full wall/ceiling section re-finish ..................... 600 - 2,000
  Undulation / waviness correction + repaint .............. 400 - 1,500
  Skirting flushness rectification ........................ 150 - 500
  Re-apply silicone bead (per joint / area) ............... 80 - 350
  Full sanitary / joinery silicone redo ................... 200 - 700
  Façade jamb silicone redo ............................... 250 - 900

Rules:
- Cost only REAL reported issues. If issues[] is empty, estimatedRepairCostAed is null.
- Set estimatedCostAed on EACH issue from the fitting line; name it in repairMethod.
- Set estimatedRepairCostAed to the sum of item ranges.`;

const JUDGING_RULES = `
JUDGING RULES (apply to every SAQL category equally):
1. Consistency: identical visual evidence → identical findings every time. No flip-flop.
2. Match the EXAMPLES in the catalogue block (clean, bubbles, crack, damage, shade,
   undulation, silicon finish/thickness, open gaps). Use them as patterns for ALL ids.
3. Clean acceptable finish → issues=[] and overallAqlStatus "within_aql".
4. Clear catalogue match → always report it (do not randomly skip).
5. Prefer specific aqlDefectId over improper_paint_finish.
6. One physical condition = one issue row.
7. Ignore only glare, dust motes, fingerprints, JPEG noise — not raised paint bumps.
8. overallCondition: excellent/good when clean; fair/poor when real defects exist.`;

function buildInstructions(isVideo: boolean): string {
  const mediaKind = isVideo ? "walkthrough video" : "photo";
  const step2 = isVideo
    ? "Watch the whole clip. Compare what you see to the EXAMPLES, then the catalogue ids. Note mm:ss."
    : "Compare what you see to the EXAMPLES, then map to catalogue ids. Same evidence → same result.";

  return `You are a SOBHA QA/QC inspector reviewing a ${mediaKind} against SCL-SAQL-001 (Paint) and SCL-SAQL-002 (Silicon Application).
Be accurate and consistent across all defect types — do not over-focus on any single defect.

STEP 1: Identify surface/zone and domain (paint / silicon / mixed / unknown).
STEP 2: ${step2}
STEP 3: For each REAL finding set aqlDefectId, aqlVerdict, acceptanceLimit, severity, cost.
STEP 4: Set overallCondition and overallAqlStatus.
If no painted surface or silicone joint is visible, set surfaceDetected to false.

${JUDGING_RULES}

${buildAqlPromptBlock()}
${RATE_CARD}
${CHECKLIST_INSTRUCTIONS}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const media = formData.get("media");
  const thumbField = formData.get("thumbnail");
  const thumbnail =
    typeof thumbField === "string" && thumbField.startsWith("data:image/")
      ? thumbField
      : null;

  if (!(media instanceof File)) {
    return NextResponse.json(
      { error: "No image or video file provided" },
      { status: 400 },
    );
  }

  const isVideo = media.type.startsWith("video/");
  const isImage = media.type.startsWith("image/");

  if (!isVideo && !isImage) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload an image or video." },
      { status: 400 },
    );
  }

  if (media.size > MAX_INLINE_BYTES) {
    return NextResponse.json(
      {
        error: `File is too large (${(media.size / (1024 * 1024)).toFixed(1)}MB). Keep it under ${MAX_INLINE_BYTES / (1024 * 1024)}MB.`,
      },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await media.arrayBuffer());

  try {
    const { output } = await generateText({
      model: MODEL,
      temperature: 0,
      seed: 42,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildInstructions(isVideo) },
            {
              type: "file",
              mediaType: media.type,
              data: buffer.toString("base64"),
            },
          ],
        },
      ],
      providerOptions: {
        google: {
          mediaResolution: "MEDIA_RESOLUTION_HIGH",
        },
      },
      output: Output.object({
        name: "WallAnalysis",
        description:
          "Structured SAQL paint/silicon condition analysis of a photo or video",
        schema: wallAnalysisSchema,
      }),
    });

    const stored = { ...output, thumbnail };

    if (isSupabaseConfigured()) {
      try {
        await saveWallAnalysis(media.name, isVideo ? "video" : "image", stored);
      } catch (dbError) {
        console.error("Failed to save wall analysis", dbError);
      }
    }

    return NextResponse.json(stored);
  } catch (error) {
    console.error("Wall analysis failed", error);
    return NextResponse.json(
      {
        error:
          "Analysis failed. Please try again with a clearer photo or video.",
      },
      { status: 502 },
    );
  }
}
