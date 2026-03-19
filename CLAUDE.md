# CLAUDE.md — NeighborScore

## What is this?

Building report card + neighborhood livability score for NYC apartment hunters. Users type any NYC address and get:

1. **Building Violations** — live HPD/DOB violation data, classified by severity
2. **Landlord Grade** — portfolio-wide violation rate compared to citywide median
3. **Neighborhood Score** — pre-computed across 6 dimensions (safety, cleanliness, noise, food safety, green space, transit)

Built for NYC Open Data Week (March 2026).

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS 4
- **Router**: React Router 6 (HashRouter for GitHub Pages)
- **Maps**: Mapbox GL JS + Mapbox Geocoding
- **Charts**: Recharts
- **Geo**: turf.js (point-in-polygon)
- **Data**: NYC Open Data (SODA API) — all client-side, no backend
- **Deploy**: GitHub Pages via GitHub Actions

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run preview      # Preview production build

# Data scripts (run with NYC_OPEN_DATA_APP_TOKEN env var)
npm run fetch-boundaries  # Download NTA boundary GeoJSON
npm run fetch-static      # Download subway stations + tree counts
npm run aggregate         # Compute neighborhood scores for all NTAs
```

## Architecture

```
src/
  lib/
    soda/           # SODA API client + typed queries
    building/       # HPD/DOB violation fetching + status computation
    landlord/       # Owner lookup chain + portfolio grading
    geo/            # Mapbox geocoding + NTA point-in-polygon
    neighborhood/   # Pre-computed score loading + lookup
    search.ts       # Master orchestrator: geocode → building + landlord + neighborhood
    colors.ts       # Status/dimension → color mappings
  pages/            # Route pages (Home, Report, Compare, Map, Methodology)
  components/       # Shared UI components
scripts/
  aggregate.ts      # Compute nta-scores.json from NYC Open Data
  fetch-boundaries.ts
  fetch-static.ts
public/data/        # Pre-computed JSON (committed, updated nightly by CI)
```

## Data Flow

```
User address → Mapbox Geocode → lat/lng
  ├── HPD Buildings (bounding box) → buildingId, registrationId
  │     ├── HPD Violations → BuildingStatus (red/orange/yellow/green)
  │     ├── DOB Complaints
  │     └── HPD Complaints
  ├── Registration Contacts → ownerName
  │     └── Owner portfolio → violation rate → LandlordGrade (A-F)
  └── NTA boundary lookup → NTAScore (pre-computed)
```

## Security Rules

- **No raw address strings in SoQL** — queries use numeric lat/lng only
- **No API keys in code** — VITE_MAPBOX_TOKEN via env, NYC_OPEN_DATA_APP_TOKEN for scripts only
- **Rate limiting** — client-side SODA = 1000 req/hour/IP. ~10-20 queries per report. SessionStorage cache to avoid repeats.

## Design Tokens

- **Fonts**: DM Sans (display), Inter (body), JetBrains Mono (data)
- **Primary**: Civic Blue #1E3A5F
- **Status**: Red #DC2626, Orange #F97316, Yellow #EAB308, Green #10B981
- **Dimensions**: Safety #4A90D9, Cleanliness #2DD4BF, Noise #F59E0B, Food #F87171, Green #22C55E, Transit #A78BFA

## Verification Gate

- `npm run build` — zero errors
- `npm run lint` — zero warnings
- `npx tsc --noEmit` — zero type errors
