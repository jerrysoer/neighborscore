import type { HPDComplaint } from '../soda/types';
import { hpdComplaintsForBuildingId } from '../soda/queries';

export async function fetchHPDComplaints(
  buildingId: string,
): Promise<HPDComplaint[]> {
  const complaints = await hpdComplaintsForBuildingId(buildingId);
  return complaints.sort(
    (a, b) =>
      new Date(b.statusdate).getTime() - new Date(a.statusdate).getTime(),
  );
}
