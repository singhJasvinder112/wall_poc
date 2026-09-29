import { createClient } from "@supabase/supabase-js";
import type { WallAnalysis } from "@/lib/wall-analysis-schema";

type WallAnalysisRow = {
  id: number;
  created_at: string;
  file_name: string;
  media_type: string;
  surface_detected: boolean;
  overall_condition: string;
  issues_count: number;
  result: WallAnalysis;
};

export type Database = {
  public: {
    Tables: {
      wall_analyses: {
        Row: WallAnalysisRow;
        Insert: Omit<WallAnalysisRow, "id" | "created_at"> &
          Partial<Pick<WallAnalysisRow, "id" | "created_at">>;
        Update: Partial<WallAnalysisRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let client: ReturnType<typeof createClient<Database>> | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
      );
    }

    client = createClient<Database>(url, key, { auth: { persistSession: false } });
  }

  return client;
}
