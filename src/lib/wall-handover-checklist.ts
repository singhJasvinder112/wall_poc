/**
 * SOBHA surface / finish handover checklist for paint + silicon SAQL keep-out.
 * The UI always renders every row; AI only fills what the camera can settle.
 */

export type CheckEvidence = "exterior" | "manual";

export type ChecklistItem = {
  id: string;
  label: string;
  evidence: CheckEvidence;
};

export type ChecklistSection = {
  id: string;
  number: number;
  title: string;
  items: ChecklistItem[];
};

export const WALL_HANDOVER_SECTIONS: ChecklistSection[] = [
  {
    id: "paint",
    number: 1,
    title: "Paint Finish (SCL-SAQL-001)",
    items: [
      { id: "paint_finish_overall", label: "Overall Paint Finish", evidence: "exterior" },
      { id: "paint_cracks_damage", label: "Cracks / Paint Damage", evidence: "exterior" },
      { id: "paint_bubbles_touchup", label: "Bubbles / Touch-Up Visibility", evidence: "exterior" },
      { id: "paint_shade_sanding", label: "Shade Variation / Sanding Marks", evidence: "exterior" },
      { id: "paint_undulation_waviness", label: "Undulation / Corner Waviness", evidence: "exterior" },
      { id: "paint_corners_edges", label: "Corners, Edges & Right Angle", evidence: "exterior" },
      { id: "paint_skirting_flush", label: "Skirting vs Wall Flushness", evidence: "exterior" },
      { id: "paint_mep_texture", label: "Texture vs Smooth around MEP", evidence: "exterior" },
    ],
  },
  {
    id: "silicon",
    number: 2,
    title: "Silicon Application (SCL-SAQL-002)",
    items: [
      { id: "silicon_facade", label: "Façade Jamb Silicone", evidence: "exterior" },
      { id: "silicon_joinery", label: "Joinery Silicone (Door / Wardrobe / Kitchen)", evidence: "exterior" },
      { id: "silicon_sanitary", label: "Sanitary Silicone (Bath / Vanity / Sink)", evidence: "exterior" },
      { id: "silicon_continuity", label: "Continuity / Termination / Peel-Off", evidence: "exterior" },
      { id: "silicon_finish", label: "Finish (Rough / Shade / Bubbles / Undulation)", evidence: "exterior" },
      { id: "silicon_straightness", label: "Straightness / Line", evidence: "exterior" },
    ],
  },
  {
    id: "zones",
    number: 3,
    title: "Zones in Frame",
    items: [
      { id: "zone_wall", label: "Wall", evidence: "exterior" },
      { id: "zone_ceiling", label: "Ceiling", evidence: "exterior" },
      { id: "zone_corners", label: "Corners / Shadow Groove / Bulkhead", evidence: "exterior" },
      { id: "zone_skirting", label: "Skirting", evidence: "exterior" },
    ],
  },
  {
    id: "verification",
    number: 4,
    title: "Further Verification",
    items: [
      { id: "feeler_gauge", label: "Straight Edge / Feeler Gauge Check", evidence: "manual" },
      { id: "german_scale", label: "German Scale (Silicon Width)", evidence: "manual" },
      { id: "right_angle_square", label: "Right-Angle Square at Corners", evidence: "manual" },
      { id: "paint_batch_match", label: "Paint Batch / Colour Match", evidence: "manual" },
    ],
  },
];

export const WALL_CHECKLIST_ITEM_IDS = WALL_HANDOVER_SECTIONS.flatMap((s) =>
  s.items.map((i) => i.id),
);

export const WALL_CAMERA_ASSESSABLE_IDS = WALL_HANDOVER_SECTIONS.flatMap((s) =>
  s.items.filter((i) => i.evidence !== "manual").map((i) => i.id),
);

export function findWallChecklistItem(itemId: string): ChecklistItem | undefined {
  for (const section of WALL_HANDOVER_SECTIONS) {
    const hit = section.items.find((i) => i.id === itemId);
    if (hit) return hit;
  }
  return undefined;
}

/** Short marks for the issue schedule on the printed form. */
export const WALL_ISSUE_MARKS: Record<string, { mark: string; label: string }> = {
  paint_corner_right_angle: { mark: "RA", label: "Corner Right Angle" },
  paint_undulation: { mark: "U", label: "Undulation" },
  paint_sanding_marks: { mark: "SM", label: "Sanding Marks" },
  paint_damage: { mark: "PD", label: "Paint Damage" },
  paint_crack: { mark: "C", label: "Paint Crack" },
  paint_touch_up: { mark: "TU", label: "Touch-Up" },
  paint_bubbles: { mark: "B", label: "Paint Bubbles" },
  improper_paint_finish: { mark: "IF", label: "Improper Finish" },
  paint_shade_variation: { mark: "SV", label: "Shade Variation" },
  skirting_flushness: { mark: "SF", label: "Skirting Flushness" },
  staircase_undulation: { mark: "SU", label: "Staircase Undulation" },
  corner_waviness: { mark: "CW", label: "Corner Waviness" },
  edge_undulation: { mark: "EU", label: "Edge Undulation" },
  texture_vs_smooth: { mark: "TX", label: "Texture vs Smooth" },
  grg_panel_line: { mark: "GRG", label: "GRG Panel Line" },
  silicon_uneven_thickness_facade: { mark: "STF", label: "Si Thickness (Façade)" },
  silicon_uneven_thickness_joinery: { mark: "STJ", label: "Si Thickness (Joinery)" },
  silicon_uneven_thickness_sanitary: { mark: "STS", label: "Si Thickness (Sanitary)" },
  uneven_silicon_application: { mark: "UA", label: "Uneven Application" },
  silicon_undulations: { mark: "SU2", label: "Si Undulations" },
  silicon_damage: { mark: "SD", label: "Si Damage" },
  silicon_rough_finish: { mark: "RF", label: "Rough Finish" },
  silicon_shade_variation: { mark: "SSV", label: "Si Shade Variation" },
  uneven_termination: { mark: "UT", label: "Uneven Termination" },
  silicon_peel_off: { mark: "PO", label: "Peel-Off" },
  silicon_discontinuous: { mark: "DC", label: "Discontinuous" },
  silicon_bubbles: { mark: "SB", label: "Si Bubbles" },
  silicon_not_in_line: { mark: "NL", label: "Not in Line" },
  other: { mark: "O", label: "Other" },
};
