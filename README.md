# NeighborScore

Building report card + neighborhood livability score for NYC apartment hunters. Look up any address and get violations, landlord grades, and neighborhood quality — all from NYC Open Data.

Built for [NYC Open Data Week](https://www.open-data.nyc/) (March 2026).

## Features

- **Building Report** — HPD/DOB violations classified by severity (Class A/B/C), seasonal patterns, and complaint history
- **Landlord Grade** — Portfolio-wide violation rate compared to citywide median (A-F)
- **Neighborhood Score** — 6-dimension livability score (safety, cleanliness, noise, food safety, green space, transit) for 195 NTAs
- **AI Analysis** — Claude-powered assessment with findings, questions to ask, and move-in recommendation
- **Interactive Map** — Choropleth map of all NYC neighborhoods with dimension toggles
- **Compare** — Side-by-side radar chart and bar comparison for up to 3 neighborhoods

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS 4
- **Routing**: React Router 6 (HashRouter for GitHub Pages)
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **Data**: NYC Open Data (SODA API) — all client-side, no backend
- **AI**: Claude API via Vercel serverless function
- **Deploy**: GitHub Pages (frontend), Vercel (verdict API)

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Add your Mapbox token: VITE_MAPBOX_TOKEN=pk.xxx

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Data Pipeline

Pre-computed neighborhood scores live in `public/data/`. To regenerate:

```bash
# Requires NYC_OPEN_DATA_APP_TOKEN env var
npm run fetch-boundaries   # Download NTA boundary GeoJSON (4.3MB)
npm run fetch-static       # Download subway stations + tree counts
npm run aggregate          # Compute nta-scores.json from 7 datasets
```

## Data Sources

All data from the [NYC Open Data Portal](https://opendata.cityofnewyork.us/):

| Dataset | SODA ID | Used For |
|---------|---------|----------|
| HPD Violations | wvxf-dwi5 | Building status |
| HPD Buildings | kj4p-ruqc | Building lookup |
| HPD Registration Contacts | tesw-yqqr | Landlord identification |
| DOB Complaints | eabe-havv | Complaint history |
| HPD Complaints | uwyv-629c | Complaint history |
| NYPD Complaint Data | qgea-i56i | Safety score |
| 311 Service Requests | erm2-nwe9 | Cleanliness + noise scores |
| Rodent Inspections | p937-wjvj | Cleanliness score |
| Restaurant Inspections | 43nn-pn8j | Food safety score |
| Street Tree Census | uvpi-gqnh | Green space score |
| MTA Subway Stations | kk4q-3rt2 | Transit score |
| NTA Boundaries | 9nt8-h7nd | Geographic mapping |

## License

MIT
