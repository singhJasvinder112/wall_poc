# Wall SAQL Inspection POC

AI paint & silicon defect inspection against SOBHA Acceptable Quality Level standards:

- **SCL-SAQL-001** — Paint (`Acceptable Quality Level(AQL) - Paint standard - R1.pptx`)
- **SCL-SAQL-002** — Silicon Application (`Acceptable Quality Level(AQL) - Silicon application standard - R1.pptx`)
- Sample media: `ConstructionImagesSobha.zip`

## Features

- Multi upload of **photos and videos**
- Gemini vision analysis mapped to the SAQL defect catalogue
- Handover form with **Save as PDF** (browser print → PDF)
- Optional Supabase history

## Setup

```bash
cp .env.example .env.local
# set GOOGLE_GENERATIVE_AI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Reference docs (keep in project root)

Do not move these — they are the acceptance source of truth for the AI prompts in `src/lib/aql-standards.ts`.
