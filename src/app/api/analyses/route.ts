import { NextResponse } from "next/server";
import { listWallAnalyses } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export type AnalysesResponse = {
  configured: boolean;
  failed: boolean;
  analyses: Awaited<ReturnType<typeof listWallAnalyses>>;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      failed: false,
      analyses: [],
    } satisfies AnalysesResponse);
  }

  try {
    return NextResponse.json({
      configured: true,
      failed: false,
      analyses: await listWallAnalyses(20),
    } satisfies AnalysesResponse);
  } catch (error) {
    console.error("Failed to list analyses", error);
    return NextResponse.json({
      configured: true,
      failed: true,
      analyses: [],
    } satisfies AnalysesResponse);
  }
}
