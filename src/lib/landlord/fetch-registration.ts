import {
  registrationContactsById,
  registrationsByOwnerName,
} from '../soda/queries';

export async function fetchOwnerName(
  registrationId: string,
): Promise<string | null> {
  const contacts = await registrationContactsById(registrationId);

  // Prefer corporate owner, fall back to individual owner
  const corporate = contacts.find(
    (c) => c.type?.toLowerCase() === 'corporateowner',
  );
  if (corporate?.corporationname) return corporate.corporationname;

  const individual = contacts.find(
    (c) => c.type?.toLowerCase() === 'individualowner',
  );
  if (individual) {
    const name = [individual.firstname, individual.lastname]
      .filter(Boolean)
      .join(' ');
    return name || null;
  }

  return null;
}

export async function fetchOwnerRegistrations(
  ownerName: string,
): Promise<string[]> {
  const contacts = await registrationsByOwnerName(ownerName);
  return [
    ...new Set(contacts.map((c) => c.registrationid).filter(Boolean)),
  ];
}
