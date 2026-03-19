import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadNTAScores } from '@/lib/neighborhood/data';
import type { NTAScore } from '@/lib/neighborhood/types';
import { AddressSearch } from '@/components/AddressSearch';
import { DimensionToggle } from '@/components/map/DimensionToggle';
import { getDimensionHex, type DimensionKey } from '@/lib/dimensions';
import { Loader2 } from 'lucide-react';

const NYC_CENTER: [number, number] = [-73.98, 40.74];
const NYC_ZOOM = 10.5;

function scoreToColor(score: number, hex: string): string {
  // Interpolate opacity: low score = more red, high score = more of dimension color
  // Simple approach: blend between red and the dimension color
  const r = score / 100;
  // Red: 220, 38, 38 (#DC2626)
  // Parse hex to rgb
  const dr = parseInt(hex.slice(1, 3), 16);
  const dg = parseInt(hex.slice(3, 5), 16);
  const db = parseInt(hex.slice(5, 7), 16);

  const red = Math.round(220 * (1 - r) + dr * r);
  const green = Math.round(38 * (1 - r) + dg * r);
  const blue = Math.round(38 * (1 - r) + db * r);

  return `rgb(${red}, ${green}, ${blue})`;
}

function buildPopupHTML(score: NTAScore): string {
  const dims = [
    ['Safety', score.safety],
    ['Cleanliness', score.cleanliness],
    ['Noise', score.noise],
    ['Food Safety', score.foodSafety],
    ['Green Space', score.greenSpace],
    ['Transit', score.transit],
  ] as const;

  const rows = dims
    .map(
      ([label, val]) =>
        `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:#6B7280">${label}</span><strong>${val}</strong></div>`,
    )
    .join('');

  return `
    <div style="font-family:Inter,sans-serif;min-width:180px">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px">${score.ntaName}</div>
      <div style="color:#6B7280;font-size:12px;margin-bottom:8px">${score.borough}</div>
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px">
        <span style="font-size:24px;font-weight:800;color:#1E3A5F">${score.composite}</span>
        <span style="font-size:11px;color:#6B7280">/ 100</span>
      </div>
      <div style="font-size:12px;display:flex;flex-direction:column;gap:2px">
        ${rows}
      </div>
    </div>
  `;
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [dimension, setDimension] = useState<DimensionKey>('composite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scoresRef = useRef<Map<string, NTAScore>>(new Map());

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !mapContainer.current) {
      setError('Mapbox token not configured');
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NYC_CENTER,
      zoom: NYC_ZOOM,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', async () => {
      try {
        // Load NTA scores and boundaries in parallel
        const [scoresData, boundariesRes] = await Promise.all([
          loadNTAScores(),
          fetch(`${import.meta.env.BASE_URL}data/nta-boundaries.geojson`),
        ]);

        if (!boundariesRes.ok) {
          throw new Error('Failed to load NTA boundaries');
        }

        const boundaries = (await boundariesRes.json()) as GeoJSON.FeatureCollection;

        // Index scores by NTA code
        const scoreMap = new Map<string, NTAScore>();
        for (const nta of scoresData.ntas) {
          scoreMap.set(nta.ntaCode, nta);
        }
        scoresRef.current = scoreMap;

        // Merge scores into GeoJSON properties
        for (const feature of boundaries.features) {
          const code = (feature.properties?.['ntaCode'] ??
            feature.properties?.['NTA2020'] ??
            feature.properties?.['nta2020'] ??
            '') as string;
          const score = scoreMap.get(code);
          if (score) {
            feature.properties = {
              ...feature.properties,
              ntaCode: code,
              composite: score.composite,
              safety: score.safety,
              cleanliness: score.cleanliness,
              noise: score.noise,
              foodSafety: score.foodSafety,
              greenSpace: score.greenSpace,
              transit: score.transit,
              ntaName: score.ntaName,
              borough: score.borough,
            };
          }
        }

        map.addSource('nta-boundaries', {
          type: 'geojson',
          data: boundaries,
        });

        // Compute fill colors for initial dimension
        const dimHex = getDimensionHex('composite');
        const fillExpression: mapboxgl.Expression = [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'composite'], 50],
          0,
          scoreToColor(0, dimHex),
          50,
          scoreToColor(50, dimHex),
          100,
          scoreToColor(100, dimHex),
        ];

        map.addLayer({
          id: 'nta-fill',
          type: 'fill',
          source: 'nta-boundaries',
          paint: {
            'fill-color': fillExpression,
            'fill-opacity': 0.6,
          },
        });

        map.addLayer({
          id: 'nta-outline',
          type: 'line',
          source: 'nta-boundaries',
          paint: {
            'line-color': '#1E3A5F',
            'line-width': 0.5,
            'line-opacity': 0.3,
          },
        });

        // Click handler for NTA popup
        map.on('click', 'nta-fill', (e) => {
          const feature = e.features?.[0];
          if (!feature || !feature.properties) return;

          const code = feature.properties['ntaCode'] as string;
          const score = scoreMap.get(code);
          if (!score) return;

          new mapboxgl.Popup({ maxWidth: '280px' })
            .setLngLat(e.lngLat)
            .setHTML(buildPopupHTML(score))
            .addTo(map);
        });

        // Cursor hover
        map.on('mouseenter', 'nta-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'nta-fill', () => {
          map.getCanvas().style.cursor = '';
        });

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load map data',
        );
        setLoading(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update fill color when dimension changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('nta-fill')) return;

    const dimKey = dimension;
    const dimHex = getDimensionHex(dimKey);

    const fillExpression: mapboxgl.Expression = [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', dimKey], 50],
      0,
      scoreToColor(0, dimHex),
      50,
      scoreToColor(50, dimHex),
      100,
      scoreToColor(100, dimHex),
    ];

    map.setPaintProperty('nta-fill', 'fill-color', fillExpression);
  }, [dimension]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-civic-blue">
          Neighborhood Map
        </h1>
        <div className="rounded-xl border border-status-red/20 bg-status-red/5 p-6 text-center">
          <p className="text-sm text-status-red">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-civic-blue">
          Neighborhood Map
        </h1>
        <DimensionToggle active={dimension} onChange={setDimension} />
      </div>

      <div className="relative">
        {/* Search overlay */}
        <div className="absolute left-3 top-3 z-10 w-72">
          <AddressSearch />
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-bg/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-civic-blue" />
              <p className="text-sm text-text-muted">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Map container */}
        <div
          ref={mapContainer}
          className="h-[600px] w-full rounded-xl border border-gray-200"
        />
      </div>
    </div>
  );
}
