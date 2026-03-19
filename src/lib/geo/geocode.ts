export interface GeocodedAddress {
  formattedAddress: string;
  lat: number;
  lng: number;
  borough: string;
  boroCode: number;
}

const BORO_CODES: Record<string, number> = {
  manhattan: 1,
  bronx: 2,
  brooklyn: 3,
  queens: 4,
  'staten island': 5,
};

export async function geocodeAddress(
  query: string,
): Promise<GeocodedAddress | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    throw new Error('VITE_MAPBOX_TOKEN is not set');
  }

  const encoded = encodeURIComponent(query);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=US&bbox=-74.26,40.49,-73.7,40.92&types=address&limit=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    features: Array<{
      place_name: string;
      center: [number, number];
      context: Array<{ id: string; text: string }>;
    }>;
  };

  const feature = data.features[0];
  if (!feature) return null;

  const [lng, lat] = feature.center;

  // Extract borough from context
  const localityCtx = feature.context?.find((c) =>
    c.id.startsWith('locality'),
  );
  const placeCtx = feature.context?.find((c) => c.id.startsWith('place'));
  const boroughText = (localityCtx?.text ?? placeCtx?.text ?? '').toLowerCase();

  const borough = Object.keys(BORO_CODES).find((b) =>
    boroughText.includes(b),
  ) ?? '';
  const boroCode = BORO_CODES[borough] ?? 0;

  return {
    formattedAddress: feature.place_name,
    lat,
    lng,
    borough: borough.charAt(0).toUpperCase() + borough.slice(1),
    boroCode,
  };
}
