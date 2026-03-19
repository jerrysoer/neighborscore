export interface NTARawScores {
  crimeCount: number;
  cleanlinessComplaints: number;
  noiseComplaints: number;
  rodentComplaints: number;
  criticalFoodViolations: number;
  treeCount: number;
  subwayStations: number;
}

export interface NTAScore {
  ntaCode: string;
  ntaName: string;
  borough: string;
  composite: number;
  safety: number;
  cleanliness: number;
  noise: number;
  foodSafety: number;
  greenSpace: number;
  transit: number;
  raw: NTARawScores;
  centroid: { lat: number; lng: number };
}

export interface NTAScoresData {
  generated_at: string;
  ntas: NTAScore[];
  metadata: {
    medianViolationRate: number;
    totalNTAs: number;
  };
}
