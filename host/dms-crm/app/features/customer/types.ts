import {
  AssignedToInfo,
  CCDResponse,
  CCDSummary,
  ContactDetail,
} from "../ccd/types";

// ─── Master item shape (shared) ───────────────────────────────────────────────
export type MasterItem = { id: number; name: string };

// ─── List / Detail types ──────────────────────────────────────────────────────
export interface Phone {
  id: number;
  category: string;
  phone: string;
  country_code: string;
  relation: number;
}

export interface Email {
  id: number;
  category: string;
  email: string;
  relation: number;
}

export interface VehicleDetail {
  id: number;
  name: string;
  vehicle_name: string;
  variant_name: string;
  color_name: string;
  manufacturing_year: string;
}

export interface Customer {
  id: number;
  inq_no: string | null;
  inquiry_age: string;
  inquiry_date: string;
  phone: Phone[];
  customer: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  name: string;
  contact: string;
  email: Email[];
  address: string;
  address2: string | null;
  city: number | null;
  city_name: string | null;
  country: number | null;
  country_name: string | null;
  zip_code: string | null;
  occupation: number | null;
  occupation_name: string | null;
  gender: string | null;
  vehicle_details: VehicleDetail[];
  deal_vehicle: number | null;
  dealer: number | null;
  inquiry_source: number | null;
  inquiry_source_name: string | null;
  kind: number | null;
  kind_name: string | null;
  is_converted_to_deal: boolean;
  assigned_to: number | null;
  is_followup: boolean;
  followup_status: string | null;
  remarks: string | null;
  existing_vehicle_name: string | null;
  our_vehicle_name: string | null;
  existing_vehicle_count: number | null;
  our_vehicle_count: number | null;
  total_fleet: number | null;
  discount_request: number;
  discount_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CustomerListResponse = PaginatedResponse<Customer>;

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_converted_to_deal?: string;
  is_followup?: string;
  kind?: string;
  dealer?: string;
}

export interface AddCustomerPhonePayload {
  category: "home" | "office" | "mobile" | "other";
  phone: string;
  country_code: string;
  relation?: number;
}

export interface AddCustomerEmailPayload {
  category: "personal" | "office";
  email: string;
  relation?: number;
}

export interface AddCustomerPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  // Optional, but the serializer rejects "" — omit it rather than sending blank.
  address?: string;
  city?: number;
  country?: number;
  phone: AddCustomerPhonePayload[];
  email: AddCustomerEmailPayload[];
  // Array of master-vehicle ids for the customer's preferred vehicles.
  vehicle: number[];
  inquiry_source: number;
  kind: number;
  remarks?: string;
  followup_after?: number;
  customer?: number;
  existing_vehicle_name?: string;
  our_vehicle_name?: string;
  existing_vehicle_count?: number;
  our_vehicle_count?: number;
}

export type VehicleEntry = {
  id: string;
  vehicle: string;
  variant: string;
  color: string;
};

// A vehicle staged on the customer via the DMS cascade. `dmsId` is the
// /dms-vehicle/ record id sent in the payload's `vehicle` array; the names +
// year are kept for display in the staged list.
export type StagedVehicle = {
  dmsId: number;
  vehicleName: string;
  variantName: string;
  colorName: string;
  year: string;
};

export type CustomerFormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  inquiry_kind: string;
  gender: string;
  address: string;
  source_type: string;
  remarks: string;
  phone: string;
  country: string;
  city: string;
  phone_category: "home" | "office" | "mobile" | "other";
  country_code: string;
  email: string;
  email_category: "personal" | "office";
  pref_vehicle: string;
  pref_variant: string;
  pref_color: string;
  existing_vehicle_name: string;
  our_vehicle_name: string;
  existing_vehicle_count: string;
  our_vehicle_count: string;
};

export type PhoneEntry = {
  id: string;
  category: "home" | "office" | "mobile" | "other";
  phone: string;
  country_code: string;
  relation: number;
};

export type EmailEntry = {
  id: string;
  category: "personal" | "office";
  email: string;
  relation: number;
};

export interface InquiryDetail extends Customer {
  ccd_responses: CCDResponse[];
  ccd_summary: CCDSummary;
  contact_details: ContactDetail;
  assigned_to_info?: AssignedToInfo;
  customer_info?: {
    type: string;
    id: number | null;
    full_name: string;
    address: string;
    city: string | null;
    country: string | null;
    gender: string | null;
  };
}

// Multi-step form state
export interface MultiStepFormState {
  currentStep: number;
  formData: CustomerFormData;
  vehicleEntries: StagedVehicle[];
  phoneEntries: PhoneEntry[];
  emailEntries: EmailEntry[];
  addVehicle: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface UpdateFormFieldPayload {
  key: keyof CustomerFormData;
  value: string;
}

export interface UpdateVehicleEntriesPayload {
  entries: VehicleEntry[];
}

export interface UpdatePhoneEntriesPayload {
  entries: PhoneEntry[];
}

export interface UpdateEmailEntriesPayload {
  entries: EmailEntry[];
}

export interface SetAddVehiclePayload {
  value: boolean;
}

export interface SetStepPayload {
  step: number;
}

export interface ResetFormPayload {
  keepStep?: boolean;
}
