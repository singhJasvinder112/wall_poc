import { getSupabase } from "@/lib/supabase";
import type { WallAnalysis } from "@/lib/wall-analysis-schema";

export type WallAnalysisRecord = {
  id: number;
  createdAt: string;
  fileName: string;
  mediaType: "image" | "video";
  surfaceDetected: boolean;
  overallCondition: string;
  issuesCount: number;
  result: WallAnalysis;
};

type WallAnalysisRow = {
  id: number;
  created_at: string;
  file_name: string;
  media_type: "image" | "video";
  surface_detected: boolean;
  overall_condition: string;
  issues_count: number;
  result: WallAnalysis;
};

function fromWallRow(row: WallAnalysisRow): WallAnalysisRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    fileName: row.file_name,
    mediaType: row.media_type,
    surfaceDetected: row.surface_detected,
    overallCondition: row.overall_condition,
    issuesCount: row.issues_count,
    result: row.result,
  };
}

export async function saveWallAnalysis(
  fileName: string,
  mediaType: "image" | "video",
  result: WallAnalysis,
): Promise<WallAnalysisRecord> {
  const { data, error } = await getSupabase()
    .from("wall_analyses")
    .insert({
      file_name: fileName,
      media_type: mediaType,
      surface_detected: result.surfaceDetected,
      overall_condition: result.overallCondition,
      issues_count: result.issues.length,
      result,
    })
    .select()
    .single();

  if (error) throw error;

  return fromWallRow(data as WallAnalysisRow);
}

export async function listWallAnalyses(limit = 20): Promise<WallAnalysisRecord[]> {
  const { data, error } = await getSupabase()
    .from("wall_analyses")
    .select()
    .order("id", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as WallAnalysisRow[]).map(fromWallRow);
}
