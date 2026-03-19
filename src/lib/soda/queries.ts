import type { SodaQueryParams } from './types';
import { DATASETS } from './types';
import { sodaFetch } from './client';
import type {
  HPDViolation,
  DOBComplaint,
  HPDComplaint,
  HPDBuilding,
  RegistrationContact,
  ServiceRequest311,
  NYPDComplaint,
  RestaurantInspection,
  TreeCensus,
  SubwayStation,
  NTABoundary,
} from './types';

// ±0.001° ≈ 100m bounding box
const BBOX_OFFSET = 0.001;

function bboxWhere(lat: number, lng: number): string {
  return `latitude > '${lat - BBOX_OFFSET}' AND latitude < '${lat + BBOX_OFFSET}' AND longitude > '${lng - BBOX_OFFSET}' AND longitude < '${lng + BBOX_OFFSET}'`;
}

// --- Building queries ---

export function violationsForBuildingCoords(lat: number, lng: number) {
  return sodaFetch<HPDViolation>(DATASETS.HPD_VIOLATIONS, {
    $where: bboxWhere(lat, lng),
    $order: 'inspectiondate DESC',
    $limit: 1000,
  });
}

export function dobComplaintsForCoords(lat: number, lng: number) {
  return sodaFetch<DOBComplaint>(DATASETS.DOB_COMPLAINTS, {
    $where: bboxWhere(lat, lng),
    $order: 'date_entered DESC',
    $limit: 500,
  });
}

export function hpdComplaintsForBuildingId(buildingId: string) {
  return sodaFetch<HPDComplaint>(DATASETS.HPD_COMPLAINTS, {
    $where: `buildingid='${buildingId}'`,
    $order: 'statusdate DESC',
    $limit: 500,
  });
}

// --- Landlord queries ---

export function hpdBuildingByCoords(lat: number, lng: number) {
  return sodaFetch<HPDBuilding>(DATASETS.HPD_BUILDINGS, {
    $where: bboxWhere(lat, lng),
    $limit: 5,
  });
}

export function registrationContactsById(registrationId: string) {
  return sodaFetch<RegistrationContact>(DATASETS.REGISTRATION_CONTACTS, {
    $where: `registrationid='${registrationId}'`,
  });
}

export function registrationsByOwnerName(name: string) {
  // Escape single quotes in name for SoQL
  const safeName = name.replace(/'/g, "''");
  return sodaFetch<RegistrationContact>(DATASETS.REGISTRATION_CONTACTS, {
    $where: `corporationname='${safeName}'`,
    $select: 'registrationid',
    $limit: 500,
  });
}

export function buildingsByRegistrationIds(ids: string[]) {
  if (ids.length === 0) return Promise.resolve([]);
  const inClause = ids.map((id) => `'${id}'`).join(',');
  return sodaFetch<HPDBuilding>(DATASETS.HPD_BUILDINGS, {
    $where: `registrationid in(${inClause})`,
    $limit: 200,
  });
}

// --- Neighborhood aggregation queries (used by scripts) ---

export function complaints311ByType(
  types: string[],
  since: string,
  params: SodaQueryParams = {},
) {
  const typeClause = types.map((t) => `'${t}'`).join(',');
  return sodaFetch<ServiceRequest311>(DATASETS.SERVICE_REQUESTS_311, {
    $where: `complaint_type in(${typeClause}) AND created_date > '${since}'`,
    $limit: 50000,
    ...params,
  });
}

export function nypdComplaintsInBBox(
  datasetId: typeof DATASETS.NYPD_COMPLAINTS_HISTORIC | typeof DATASETS.NYPD_COMPLAINTS_YTD,
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  since: string,
) {
  return sodaFetch<NYPDComplaint>(datasetId, {
    $where: `latitude > '${bbox.minLat}' AND latitude < '${bbox.maxLat}' AND longitude > '${bbox.minLng}' AND longitude < '${bbox.maxLng}' AND cmplnt_fr_dt > '${since}'`,
    $limit: 50000,
  });
}

export function restaurantInspections(params: SodaQueryParams = {}) {
  return sodaFetch<RestaurantInspection>(DATASETS.RESTAURANT_INSPECTIONS, {
    $limit: 50000,
    ...params,
  });
}

export function treeCountsByNTA(params: SodaQueryParams = {}) {
  return sodaFetch<TreeCensus>(DATASETS.TREE_CENSUS, {
    $select: 'nta, count(*) as count',
    $group: 'nta',
    ...params,
  });
}

export function subwayStations() {
  return sodaFetch<SubwayStation>(DATASETS.SUBWAY_STATIONS, {
    $limit: 1000,
  });
}

export function ntaBoundaries() {
  return sodaFetch<NTABoundary>(DATASETS.NTA_BOUNDARIES, {
    $limit: 500,
    $where: "ntatype='0'", // Residential NTAs only
  });
}
