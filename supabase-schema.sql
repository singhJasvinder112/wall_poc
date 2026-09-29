create table if not exists wall_analyses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  file_name text not null,
  media_type text not null,
  surface_detected boolean not null,
  overall_condition text not null,
  issues_count integer not null,
  result jsonb not null
);
