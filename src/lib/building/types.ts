import type { HPDViolation, DOBComplaint, HPDComplaint } from '../soda/types';

export type BuildingStatusLevel = 'red' | 'orange' | 'yellow' | 'green';

export interface BuildingStatus {
  level: BuildingStatusLevel;
  label: string;
  openClassA: number;
  openClassB: number;
  openClassC: number;
  totalViolations: number;
  resolvedViolations: number;
}

export interface BuildingReport {
  status: BuildingStatus;
  violations: HPDViolation[];
  dobComplaints: DOBComplaint[];
  hpdComplaints: HPDComplaint[];
}
