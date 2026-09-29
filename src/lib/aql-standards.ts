/**
 * SOBHA Acceptable Quality Level (SAQL) criteria extracted from:
 * - SCL-SAQL-001 Paint standard R1
 * - SCL-SAQL-002 Silicon application standard R1
 *
 * This is the source of truth for AI defect checking. Visual inspection
 * distance is typically 1 m under natural / ambient / artificial light.
 * Measurement verification applies when a visual discrepancy is seen.
 */

export type AqlDomain = "paint" | "silicon";

export type AqlVerdict = "pass" | "fail" | "needs_measurement";

export type AqlDefect = {
  id: string;
  domain: AqlDomain;
  label: string;
  /** Acceptance limit in plain language for the model + report. */
  acceptanceLimit: string;
  /** How QA normally verifies (visual vs instrument). */
  method: string;
  /** Zones / locations this defect applies to. */
  zones: string[];
  /** True when a camera alone cannot settle the limit (needs gauge/scale). */
  requiresMeasurement: boolean;
};

export const PAINT_AQL_DEFECTS: AqlDefect[] = [
  {
    id: "paint_corner_right_angle",
    domain: "paint",
    label: "Paint Corner Right Angle",
    acceptanceLimit: "Max 1 mm gap (wall / corners). Not applicable on ceiling.",
    method: "Right-angle scale & straight edge",
    zones: ["wall", "corners", "ceiling-to-wall", "wall-to-wall"],
    requiresMeasurement: true,
  },
  {
    id: "paint_undulation",
    domain: "paint",
    label: "Paint Undulation",
    acceptanceLimit: "1.5 mm every 3 m — no waviness (wall / bulkhead). NA on ceiling.",
    method: "Straight edge & feeler gauge",
    zones: ["wall", "bulkhead"],
    requiresMeasurement: true,
  },
  {
    id: "paint_sanding_marks",
    domain: "paint",
    label: "Improper Sanding Mark Visibility",
    acceptanceLimit: "Not visible from 1 m at any angle",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "paint_damage",
    domain: "paint",
    label: "Paint Damage",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "paint_crack",
    domain: "paint",
    label: "Paint Crack",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "paint_touch_up",
    domain: "paint",
    label: "Paint Touch-Up",
    acceptanceLimit: "Not visible from 1 m at any angle",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "paint_bubbles",
    domain: "paint",
    label: "Paint Bubbles",
    acceptanceLimit: "Not visible from 1 m at any angle",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "improper_paint_finish",
    domain: "paint",
    label: "Improper Paint Finish",
    acceptanceLimit: "Not visible from 1 m at any angle",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "paint_shade_variation",
    domain: "paint",
    label: "Paint Shade Variation",
    acceptanceLimit: "Not visible from 1 m at any angle",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "corners", "shadow_groove", "bulkhead", "cove_light"],
    requiresMeasurement: false,
  },
  {
    id: "skirting_flushness",
    domain: "paint",
    label: "Skirting vs Wall Paint Flushness",
    acceptanceLimit: "0.5 mm max on wall area; 0 mm on corner area",
    method: "Straight edge & feeler gauge",
    zones: ["wall", "corners", "skirting"],
    requiresMeasurement: true,
  },
  {
    id: "staircase_undulation",
    domain: "paint",
    label: "Staircase Bottom Undulation (Flatness)",
    acceptanceLimit: "1 mm / soffit width",
    method: "Straight edge & feeler gauge",
    zones: ["staircase", "soffit"],
    requiresMeasurement: true,
  },
  {
    id: "corner_waviness",
    domain: "paint",
    label: "Paint Corner Waviness",
    acceptanceLimit: "1 mm wall side; 0 mm metal side / shadow groove",
    method: "Straight edge & feeler gauge",
    zones: ["corners", "shadow_groove", "wall"],
    requiresMeasurement: true,
  },
  {
    id: "edge_undulation",
    domain: "paint",
    label: "Paint Edge Undulation",
    acceptanceLimit: "0.5 mm over 3 m (ceiling edge / exposed corner)",
    method: "Straight edge",
    zones: ["ceiling", "corners", "edge"],
    requiresMeasurement: true,
  },
  {
    id: "texture_vs_smooth",
    domain: "paint",
    label: "Paint Pattern — Texture vs Smooth (Around MEP Fixtures)",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["wall", "ceiling", "mep_fixtures"],
    requiresMeasurement: false,
  },
  {
    id: "grg_panel_line",
    domain: "paint",
    label: "GRG Panel Line Verticality and Corner",
    acceptanceLimit: "0.5 mm over 3 m",
    method: "Putty & feeler gauge",
    zones: ["wall", "grg", "corners"],
    requiresMeasurement: true,
  },
];

export const SILICON_AQL_DEFECTS: AqlDefect[] = [
  {
    id: "silicon_uneven_thickness_facade",
    domain: "silicon",
    label: "Silicon Uneven Thickness (Façade)",
    acceptanceLimit:
      "Width 6–10 mm allowed; side-to-side difference max 1 mm; straightness 0 mm on a single side",
    method: "German scale + visual",
    zones: ["facade_internal_jamb", "facade_external_jamb"],
    requiresMeasurement: true,
  },
  {
    id: "silicon_uneven_thickness_joinery",
    domain: "silicon",
    label: "Silicon Uneven Thickness (Joinery)",
    acceptanceLimit: "Width 3–4 mm (doors/wardrobe); kitchen cabinets 3 mm (+1/−0); straightness 0 mm",
    method: "German scale + visual",
    zones: ["wardrobe", "kitchen_cabinets", "doors"],
    requiresMeasurement: true,
  },
  {
    id: "silicon_uneven_thickness_sanitary",
    domain: "silicon",
    label: "Silicon Uneven Thickness (Sanitary)",
    acceptanceLimit: "Width 3–4 mm typical; bathtub 3 mm (+1/−0); straightness 0 mm on a single side",
    method: "German scale",
    zones: ["bathtub", "shower", "vanity", "sink", "tile_skirting", "control_joint"],
    requiresMeasurement: true,
  },
  {
    id: "uneven_silicon_application",
    domain: "silicon",
    label: "Uneven Silicone Application",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_undulations",
    domain: "silicon",
    label: "Silicone Undulations",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_damage",
    domain: "silicon",
    label: "Silicone Damage",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_rough_finish",
    domain: "silicon",
    label: "Silicone Rough Finish",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_shade_variation",
    domain: "silicon",
    label: "Silicone Shade Variation",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "uneven_termination",
    domain: "silicon",
    label: "Uneven Termination",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_peel_off",
    domain: "silicon",
    label: "Silicone Peel-Off",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_discontinuous",
    domain: "silicon",
    label: "Silicone Discontinuous",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_bubbles",
    domain: "silicon",
    label: "Silicon Bubble Formation",
    acceptanceLimit: "Not allowed",
    method: "Visual inspection (≥ 1 m)",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: false,
  },
  {
    id: "silicon_not_in_line",
    domain: "silicon",
    label: "Silicon Not in Line (Straightness)",
    acceptanceLimit: "0 mm deviation",
    method: "German scale",
    zones: ["facade", "joinery", "sanitary"],
    requiresMeasurement: true,
  },
];

export const ALL_AQL_DEFECTS = [...PAINT_AQL_DEFECTS, ...SILICON_AQL_DEFECTS];

export const AQL_DEFECT_IDS = ALL_AQL_DEFECTS.map((d) => d.id);

/** Compact prompt block the analyze route injects. */
export function buildAqlPromptBlock(): string {
  const paint = PAINT_AQL_DEFECTS.map(
    (d) =>
      `  - ${d.id}: ${d.label}. Limit: ${d.acceptanceLimit}. Method: ${d.method}. Zones: ${d.zones.join(", ")}.${d.requiresMeasurement ? " Camera alone cannot prove the mm limit — if visually suspect, set aqlVerdict to needs_measurement." : ""}`,
  ).join("\n");

  const silicon = SILICON_AQL_DEFECTS.map(
    (d) =>
      `  - ${d.id}: ${d.label}. Limit: ${d.acceptanceLimit}. Method: ${d.method}. Zones: ${d.zones.join(", ")}.${d.requiresMeasurement ? " Camera alone cannot prove the mm limit — if visually suspect, set aqlVerdict to needs_measurement." : ""}`,
  ).join("\n");

  return `
SOBHA SAQL DEFECT CATALOGUE (SCL-SAQL-001 Paint + SCL-SAQL-002 Silicon).
Judge ONLY what is clearly visible. Map each REAL finding to the closest defect id below.
Visual checks are as if standing ≥ 1 m under natural / ambient / artificial light.

CRITICAL — DO NOT OVER-REPORT (false positives are worse than a miss):
- Empty issues[] is CORRECT and preferred when the finish looks acceptable.
- Report a defect ONLY if a trained QA inspector would almost certainly mark it on a keep-out form.
- If unsure / ambiguous / only visible because of extreme close-up zoom → DO NOT report it.
- NEVER invent defects. NEVER pad the list to look thorough.
- Do NOT report: normal plaster texture, roller stipple, soft shadows, glare, reflections,
  dust, construction dirt that is not finish damage, compression artefacts, slight colour
  variation from lighting, or a clean continuous silicone bead.
- Do NOT use improper_paint_finish as a catch-all for "something looks slightly imperfect".
  That id is only for a clearly visible bad finish from ~1 m (obvious brush marks, patchy
  coverage, orange-peel / roughness finish that stands out).
- Close-up photos exaggerate tiny marks. Mentally step back to 1 m — if it would disappear
  at that distance, it is NOT a defect under SAQL visual rules.
- mm / flushness / straightness items: only "needs_measurement" when there is a CLEAR
  visible gap, waviness, or uneven bead. Do not flag "maybe slightly off".

PAINT (SCL-SAQL-001):
${paint}

SILICON (SCL-SAQL-002):
${silicon}

aqlVerdict rules:
- "fail" — unmistakable visual breach of a "Not allowed" / "Not visible from 1 m" limit.
- "needs_measurement" — CLEAR visual suspicion against an mm/straightness limit (not a maybe).
- "pass" — do not emit pass rows; omit clean items entirely.
`;
}
