// NYC Open Data (SODA) dataset IDs
export const DATASETS = {
  HPD_VIOLATIONS: 'wvxf-dwi5',
  DOB_COMPLAINTS: 'eabe-havv',
  HPD_COMPLAINTS: 'a2h7-iqsi',
  HPD_BUILDINGS: 'kj4p-ruqc',
  REGISTRATION_CONTACTS: 'feu5-w2e2',
  DWELLING_REGISTRATIONS: 'tesw-yqqr',
  SERVICE_REQUESTS_311: 'erm2-nwe9',
  NYPD_COMPLAINTS_HISTORIC: '5uac-w243',
  NYPD_COMPLAINTS_YTD: 'qgea-i56i',
  RESTAURANT_INSPECTIONS: '43nn-pn8j',
  TREE_CENSUS: 'uvpi-gqnh',
  SUBWAY_STATIONS: '39hk-dx4f', // MTA dataset on data.ny.gov
  NTA_BOUNDARIES: '9nt8-h7nd',
} as const;

export type DatasetId = (typeof DATASETS)[keyof typeof DATASETS];

// --- Row shapes for each dataset ---

export interface HPDViolation {
  violationid: string;
  boroid: string;
  block: string;
  lot: string;
  class: 'A' | 'B' | 'C';
  violationstatus: string;
  inspectiondate: string;
  novdescription: string;
  latitude: string;
  longitude: string;
}

export interface DOBComplaint {
  complaint_number: string;
  house_number: string;
  house_street: string;
  date_entered: string;
  complaint_category: string;
  status: string;
  community_board: string;
  zip_code: string;
}

export interface HPDComplaint {
  complaintid: string;
  buildingid: string;
  status: string;
  statusdate: string;
  type: string;
  majorcategory: string;
  minorcategory: string;
}

export interface HPDBuilding {
  buildingid: string;
  registrationid: string;
  boroid: string;
  block: string;
  lot: string;
  unitsres: string;
  latitude: string;
  longitude: string;
  streetaddress?: string;
}

export interface RegistrationContact {
  registrationid: string;
  type: string;
  corporationname: string;
  firstname: string;
  lastname: string;
}

export interface DwellingRegistration {
  registrationid: string;
  buildingid: string;
  boroid: string;
  block: string;
  lot: string;
}

export interface ServiceRequest311 {
  unique_key: string;
  complaint_type: string;
  created_date: string;
  latitude: string;
  longitude: string;
  community_board: string;
  descriptor: string;
  borough: string;
}

export interface NYPDComplaint {
  cmplnt_num: string;
  ofns_desc: string;
  latitude: string;
  longitude: string;
  cmplnt_fr_dt: string;
  boro_nm: string;
}

export interface RestaurantInspection {
  camis: string;
  dba: string;
  cuisine_description: string;
  violation_code: string;
  grade: string;
  latitude: string;
  longitude: string;
  inspection_date: string;
  critical_flag: string;
}

export interface TreeCensus {
  tree_id: string;
  nta: string;
  spc_common: string;
  health: string;
}

export interface SubwayStation {
  name: string;
  line: string;
  the_geom: {
    type: string;
    coordinates: [number, number];
  };
}

export interface NTABoundary {
  nta2020: string;
  ntaname: string;
  boroname: string;
  ntatype: string;
  the_geom: {
    type: string;
    coordinates: number[][][][];
  };
}

// --- Query parameter types ---

export interface SodaQueryParams {
  $where?: string;
  $select?: string;
  $order?: string;
  $limit?: number;
  $offset?: number;
  $group?: string;
}
