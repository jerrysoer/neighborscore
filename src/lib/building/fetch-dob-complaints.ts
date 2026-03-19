import type { DOBComplaint } from '../soda/types';
import { dobComplaintsForCoords } from '../soda/queries';

export async function fetchDOBComplaints(
  lat: number,
  lng: number,
): Promise<DOBComplaint[]> {
  const complaints = await dobComplaintsForCoords(lat, lng);
  return complaints.sort(
    (a, b) =>
      new Date(b.date_entered).getTime() - new Date(a.date_entered).getTime(),
  );
}
