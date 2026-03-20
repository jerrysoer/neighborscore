import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { NTAScore, NTAScoresData } from '../lib/neighborhood/types';
import { AddressSearch } from '../components/AddressSearch';
import { NeighborhoodScoreCard } from '../components/NeighborhoodScoreCard';
import { geocodeAddress } from '../lib/geo/geocode';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedNTA, setSelectedNTA] = useState<NTAScore | null>(null);
  const scoresRef = useRef<NTAScore[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.95, 40.73],
      zoom: 10,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', async () => {
      try {
        const [geoRes, scoresRes] = await Promise.all([
          fetch(import.meta.env.BASE_URL + 'data/nta-boundaries.geojson'),
          fetch(import.meta.env.BASE_URL + 'data/nta-scores.json'),
        ]);

        const geojson = (await geoRes.json()) as GeoJSON.FeatureCollection;
        const scoresData = (await scoresRes.json()) as NTAScoresData;
        scoresRef.current = scoresData.ntas;

        const scoreMap = new Map<string, NTAScore>();
        for (const nta of scoresData.ntas) {
          scoreMap.set(nta.ntaCode, nta);
        }

        for (const feature of geojson.features) {
          const code =
            (feature.properties?.nta2020 as string) ??
            (feature.properties?.ntacode as string) ??
            '';
          const score = scoreMap.get(code);
          if (score && feature.properties) {
            feature.properties.composite = score.composite;
            feature.properties.ntaName = score.ntaName;
            feature.properties.ntaCode = code;
          }
        }

        map.addSource('ntas', { type: 'geojson', data: geojson });

        map.addLayer({
          id: 'nta-fill',
          type: 'fill',
          source: 'ntas',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'composite'], 50],
              0,
              '#DC2626',
              50,
              '#EAB308',
              100,
              '#10B981',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              0.6,
            ],
          },
        });

        map.addLayer({
          id: 'nta-line',
          type: 'line',
          source: 'ntas',
          paint: {
            'line-color': '#1E3A5F',
            'line-width': 1,
            'line-opacity': 0.3,
          },
        });

        let hoveredId: string | number | undefined;

        map.on('mousemove', 'nta-fill', (e) => {
          if (e.features && e.features.length > 0) {
            if (hoveredId !== undefined) {
              map.setFeatureState({ source: 'ntas', id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0]?.id;
            if (hoveredId !== undefined) {
              map.setFeatureState({ source: 'ntas', id: hoveredId }, { hover: true });
            }
            map.getCanvas().style.cursor = 'pointer';
          }
        });

        map.on('mouseleave', 'nta-fill', () => {
          if (hoveredId !== undefined) {
            map.setFeatureState({ source: 'ntas', id: hoveredId }, { hover: false });
          }
          hoveredId = undefined;
          map.getCanvas().style.cursor = '';
        });

        map.on('click', 'nta-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const props = e.features[0]?.properties;
            const code = props?.ntaCode as string | undefined;
            if (code) {
              const nta = scoreMap.get(code) ?? null;
              setSelectedNTA(nta);
            }
          }
        });
      } catch {
        // Data loading failed silently
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  async function handleSearch(address: string) {
    const result = await geocodeAddress(address);
    if (result && mapRef.current) {
      mapRef.current.flyTo({ center: [result.lng, result.lat], zoom: 14 });
    }
  }

  return (
    <div className="relative -mx-4 -mt-8" style={{ height: 'calc(100vh - 64px)' }}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* Search overlay */}
      <div className="absolute left-4 top-4 z-10 w-80">
        <AddressSearch onSelect={handleSearch} compact placeholder="Search address..." />
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-12 z-10 rounded-xl border border-gray-200 bg-surface/90 backdrop-blur-sm px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-text-muted mb-2">
          Neighborhood Score
        </p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-muted">0</span>
          <div
            className="h-3 w-32 rounded-full"
            style={{
              background: 'linear-gradient(to right, #DC2626, #EAB308, #10B981)',
            }}
          />
          <span className="text-xs text-text-muted">100</span>
        </div>
      </div>

      {/* Sidebar */}
      {selectedNTA && (
        <div className="absolute right-4 top-4 z-10 w-80 max-h-[calc(100vh-128px)] overflow-y-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedNTA(null)}
              className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-gray-200 text-text-muted hover:text-text text-xs shadow"
            >
              ✕
            </button>
            <NeighborhoodScoreCard score={selectedNTA} />
          </div>
        </div>
      )}
    </div>
  );
}
