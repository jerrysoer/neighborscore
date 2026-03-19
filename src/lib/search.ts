import type { BuildingReport } from './building/types';
import type { LandlordProfile } from './landlord/types';
import type { NTAScore } from './neighborhood/types';
import type { GeocodedAddress } from './geo/geocode';
import { geocodeAddress } from './geo/geocode';
import { fetchHPDBuilding } from './landlord/fetch-building';
import { fetchViolations } from './building/fetch-violations';
import { fetchDOBComplaints } from './building/fetch-dob-complaints';
import { fetchHPDComplaints } from './building/fetch-hpd-complaints';
import { computeBuildingStatus } from './building/compute-status';
import {
  fetchOwnerName,
  fetchOwnerRegistrations,
} from './landlord/fetch-registration';
import {
  fetchPortfolioBuildings,
  fetchPortfolioViolations,
} from './landlord/fetch-portfolio';
import { computeLandlordGrade } from './landlord/compute-grade';
import { lookupNTA } from './geo/lookup';
import { lookupNTAScore, getMedianViolationRate } from './neighborhood/lookup';

export interface AddressReport {
  address: GeocodedAddress;
  building: BuildingReport;
  landlord: LandlordProfile | null;
  neighborhood: NTAScore | null;
}

// SessionStorage cache key
function cacheKey(lat: number, lng: number): string {
  return `ns_${lat.toFixed(5)}_${lng.toFixed(5)}`;
}

export async function searchAddress(query: string): Promise<AddressReport> {
  // Check sessionStorage cache
  const cached = sessionStorage.getItem(`ns_query_${query}`);
  if (cached) {
    return JSON.parse(cached) as AddressReport;
  }

  // Step 1: Geocode
  const address = await geocodeAddress(query);
  if (!address) {
    throw new Error('Address not found. Try a specific NYC street address.');
  }

  const { lat, lng } = address;

  // Check coordinate cache
  const coordCached = sessionStorage.getItem(cacheKey(lat, lng));
  if (coordCached) {
    return JSON.parse(coordCached) as AddressReport;
  }

  // Step 2: HPD building lookup (needed for both building + landlord)
  const hpdBuilding = await fetchHPDBuilding(lat, lng);

  // Step 3: Parallel queries
  const [violations, dobComplaints, hpdComplaints, ntaMatch] =
    await Promise.all([
      fetchViolations(lat, lng),
      fetchDOBComplaints(lat, lng),
      hpdBuilding
        ? fetchHPDComplaints(hpdBuilding.buildingid)
        : Promise.resolve([]),
      lookupNTA(lat, lng),
    ]);

  // Build report
  const status = computeBuildingStatus(violations);
  const building: BuildingReport = {
    status,
    violations,
    dobComplaints,
    hpdComplaints,
  };

  // Step 4: Landlord chain (sequential due to dependencies)
  let landlord: LandlordProfile | null = null;
  if (hpdBuilding?.registrationid) {
    try {
      const ownerName = await fetchOwnerName(hpdBuilding.registrationid);
      if (ownerName) {
        const registrationIds = await fetchOwnerRegistrations(ownerName);
        const portfolioBuildings =
          await fetchPortfolioBuildings(registrationIds);
        const { total, hazardous } =
          await fetchPortfolioViolations(portfolioBuildings);
        const medianRate = await getMedianViolationRate().catch(() => undefined);
        landlord = computeLandlordGrade(
          ownerName,
          portfolioBuildings,
          total,
          hazardous,
          medianRate,
        );
      }
    } catch {
      // Landlord data is best-effort — don't fail the whole report
      landlord = null;
    }
  }

  // Step 5: Neighborhood score
  let neighborhood: NTAScore | null = null;
  if (ntaMatch) {
    neighborhood = await lookupNTAScore(ntaMatch.ntaCode);
  }

  const report: AddressReport = { address, building, landlord, neighborhood };

  // Cache result
  try {
    const serialized = JSON.stringify(report);
    sessionStorage.setItem(`ns_query_${query}`, serialized);
    sessionStorage.setItem(cacheKey(lat, lng), serialized);
  } catch {
    // sessionStorage full — ignore
  }

  return report;
}
