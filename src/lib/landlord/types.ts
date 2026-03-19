export type LandlordGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PortfolioBuilding {
  buildingId: string;
  registrationId: string;
  address?: string;
  units: number;
  lat: number;
  lng: number;
}

export interface LandlordProfile {
  ownerName: string;
  portfolioSize: number;
  totalUnits: number;
  totalOpenViolations: number;
  hazardousViolations: number;
  violationRate: number;
  grade: LandlordGrade;
  buildings: PortfolioBuilding[];
}
