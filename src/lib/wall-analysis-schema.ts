import { z } from "zod";
import { AQL_DEFECT_IDS } from "@/lib/aql-standards";

export const checkStatusSchema = z.enum(["good", "attention", "not_assessable"]);

export const aqlVerdictSchema = z.enum(["pass", "fail", "needs_measurement"]);

export const surfaceTypeSchema = z.enum([
  "wall",
  "ceiling",
  "corner",
  "bulkhead",
  "shadow_groove",
  "skirting",
  "facade_jamb",
  "joinery",
  "sanitary",
  "other",
]);

export const domainSchema = z.enum(["paint", "silicon", "mixed", "unknown"]);

const aqlDefectIdSchema = z
  .string()
  .describe(`One of the SAQL defect ids: ${AQL_DEFECT_IDS.join(", ")}`);

export const wallAnalysisSchema = z.object({
  surfaceDetected: z
    .boolean()
    .describe("Whether a painted surface, silicon joint, or related finish is clearly visible"),
  surfaceType: surfaceTypeSchema
    .nullable()
    .describe("Primary surface / zone visible. Null if surfaceDetected is false."),
  domain: domainSchema.describe(
    "Whether findings are mainly paint, silicon, both, or unclear",
  ),
  overallCondition: z
    .enum(["excellent", "good", "fair", "poor"])
    .describe("Overall finish condition against SAQL aesthetics acceptance"),
  overallAqlStatus: z
    .enum(["within_aql", "outside_aql", "partial_measurement_needed"])
    .describe(
      "within_aql = no fail findings; outside_aql = at least one fail; partial_measurement_needed = only needs_measurement findings (or mix without clear fail)",
    ),
  roomOrArea: z
    .string()
    .nullable()
    .describe('Room/area if clear, e.g. "Master bath vanity". Null if unknown — never guess.'),
  issues: z
    .array(
      z.object({
        aqlDefectId: aqlDefectIdSchema
          .nullable()
          .describe("Mapped SAQL defect id, or null if no catalogue match"),
        location: z
          .string()
          .describe('Where on the surface, e.g. "upper left corner", "bathtub silicone joint"'),
        zone: z
          .string()
          .nullable()
          .describe("SAQL zone if identifiable, e.g. wall, ceiling, facade jamb, sanitary"),
        severity: z.enum(["minor", "moderate", "severe"]),
        aqlVerdict: aqlVerdictSchema.describe(
          "pass / fail / needs_measurement against the SAQL acceptance limit",
        ),
        acceptanceLimit: z
          .string()
          .nullable()
          .describe("The SAQL acceptance limit quoted for this defect"),
        approximateSize: z
          .string()
          .describe('Rough size, e.g. "hairline crack ~20cm", "silicone bead uneven along 40cm"'),
        description: z.string().describe("Short description of what is visible"),
        repairMethod: z
          .string()
          .nullable()
          .describe("Suggested rectification, e.g. re-sand and repaint, re-apply silicone"),
        estimatedCostAed: z
          .object({ low: z.number(), high: z.number() })
          .nullable()
          .describe("Indicative rectification cost in AED"),
        timestamp: z
          .string()
          .nullable()
          .describe("Video only: mm:ss where best visible. Null for photos."),
      }),
    )
    .describe("Every distinct SAQL defect visible in the media"),
  checklist: z
    .array(
      z.object({
        itemId: z.string().describe("Checklist item id from the handover form"),
        status: checkStatusSchema,
        remark: z
          .string()
          .nullable()
          .describe("Short note when status is attention; otherwise null"),
      }),
    )
    .nullable()
    .describe("Handover checklist findings only when media genuinely shows the item"),
  otherIssues: z
    .array(z.string())
    .describe("Non-SAQL observations (loose fixture, exposed wiring, etc.). Usually empty."),
  recommendation: z
    .string()
    .describe("Recommended next step for QA/QC keep-out or handover"),
  estimatedRepairCostAed: z
    .object({ low: z.number(), high: z.number() })
    .nullable()
    .describe("Sum of item costs in AED, or null if not estimable"),
});

export type WallHandoverMeta = {
  recordNo?: string | null;
  propertyUnitNo?: string | null;
  inspectedBy?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
};

export type StoredWallAnalysis = z.infer<typeof wallAnalysisSchema> & {
  thumbnail?: string | null;
  handover?: WallHandoverMeta | null;
};

export type WallAnalysis = StoredWallAnalysis;
export type SurfaceType = z.infer<typeof surfaceTypeSchema>;
export type AqlVerdict = z.infer<typeof aqlVerdictSchema>;
