export interface MasterVehicle {
  id: number;
  name: string;
  brand: string | null;
  firm: number;
  firm_name: string;
  rank: number;
}

// A DMS vehicle combination row from /dms-vehicle/. One row = a unique
// vehicle + variant + color (+ manufacturing_year) pairing; `id` is what the
// inquiry payload's `vehicle` array wants.
export interface DmsVehicleRef {
  id: number;
  name: string;
}

export interface DmsVehicle {
  id: number;
  vehicle: DmsVehicleRef;
  variant: DmsVehicleRef;
  color: DmsVehicleRef;
  manufacturing_year: string | null;
}

export interface MasterVariant {
  id: number;
  name: string;
  rank: number;
}

export interface MasterColor {
  id: number;
  name: string;
  code: string;
  rank: number;
}

export interface MasterRelation {
  id: number;
  name: string;
}

export interface MasterCity {
  id: number;
  name: string;
  mun_vdcs: null;
  district: null;
  country: number;
}

export interface MasterCountry {
  id: number;
  name: string;
  status: boolean;
}

export interface MasterInquiryKind {
  id: number;
  name: string;
  status: boolean;
}

export interface MasterSourceType {
  id: number;
  name: string;
  rank: number;
}

export interface MasterDealer {
  id: number;
  name: string;
  dealer_contact_person: string | null;
  is_deleted: boolean;
  restored_at: string | null;
}

export interface MasterFilterOptions {
  dealers: { label: string; value: string }[];
  brands: { label: string; value: string }[];
  vehicles: { label: string; value: string }[];
}
