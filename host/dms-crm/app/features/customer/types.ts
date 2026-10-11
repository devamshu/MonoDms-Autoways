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
  // Master FK ids (InquiryViewSerializer.get_vehicle_details) — used to prefill
  // the Convert-to-Deal cascade. Optional so older payloads stay valid.
  vehicle?: number | null;
  variant?: number | null;
  color?: number | null;
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
  // Optional: present on the list serializer (same one the web reads) but not
  // needed by every consumer, so older payloads stay valid.
  contact_person?: string | null;
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
  deal_vehicle_details?: VehicleDetail | null;
  dealer: number | null;
  dealer_name?: string | null;
  inquiry_source: number | null;
  inquiry_source_name: string | null;
  kind: number | null;
  kind_name: string | null;
  is_converted_to_deal: boolean;
  // Pipeline/booking status fields returned by GET /crm/inquiry/ (used by the
  // action drawer to decide which actions apply). Optional so older payloads
  // without them don't break the list.
  status?: string | null;
  is_booked?: boolean;
  booking_approval_status?: string | null;
  booking_approved_at?: string | null;
  booking_sheet_no?: string | null;
  booking_rejection_reason?: string | null;
  revert_stage_approval_status?: string | null;
  closure_approval_status?: string | null;
  deal_amount?: string | number | null;
  booking_amount?: string | number | null;
  total_payments_made?: number | null;
  assigned_to_name?: string | null;
  assigned_to: number | null;
  // Review state (set via POST /crm/inquiry/{id}/review/).
  salesperson_voice?: string | null;
  hod_voice?: string | null;
  is_reviewed?: boolean;
  // Pending-kind-change state (POST /crm/inquiry/{id}/request-kind-change/ and
  // the cancel counterpart).
  kind_change_approval_status?: string | null;
  kind_change_note?: string | null;
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
  is_booked?: string;
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
  name: string;
  phone: AddCustomerPhonePayload[];
  email?: AddCustomerEmailPayload[];
  contact_person?: string;
  address?: string;
  city?: number;
  district?: number;
  zip_code?: string;
  occupation?: number;
  vehicle: number[];
  inquiry_source: number;
  kind: number;
  remarks?: string;
  followup_after?: number;
  customer?: number;
  assigned_to?: number;
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
  name: string;
  inquiry_kind: string;
  address: string;
  source_type: string;
  remarks: string;
  phone: string;
  city: string;
  phone_category: "home" | "office" | "mobile" | "other";
  country_code: string;
  email: string;
  email_category: "personal" | "office";
  pref_vehicle: string;
  pref_variant: string;
  pref_color: string;
  assigned_to: string;
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

// ─── Inquiry sub-resources (read-only lists shown in the action drawer) ───────

export interface ActivityItem {
  id: number;
  created_at: string;
  followup_date: string | null;
  followup_date_np?: string | null;
  next_followup_date?: string | null;
  time: string | null;
  priority: string | null;
  followup_type: string | null;
  followup_details: string | null;
  is_activity: boolean;
  executive_name: string | null;
}

export interface NoteItem {
  id: number;
  inquiry?: number;
  inquiry_id?: number;
  note: string;
  created_at?: string | null;
  created_by_name?: string | null;
}

export interface DealStatusItem {
  id: number;
  status_name: string | null;
  sub_status_name: string | null;
  status_date: string | null;
  remarks: string | null;
  created_by_name?: string | null;
  created_at: string;
  is_approved?: boolean | null;
}

export interface TestDriveItem {
  id: number;
  inquiry: number;
  vehicle: number | null;
  reported_by: number | null;
  scheduled_date: string | null;
  end_time: string | null;
  start_meter: number | null;
  end_meter: number | null;
  kms: number | null;
  test_drive_status: string | null;
  feedback: string | null;
  created_at: string;
}

// POST /crm/test-drive/ (web CRM/Inquiry/DetailsTabs/TestDriveTabs).
export interface CreateTestDrivePayload {
  inquiry: number;
  // Dealer-stock id, not a DMS-vehicle id.
  vehicle: number;
  reported_by: number | null;
  scheduled_date: string;
  end_time: string | null;
  start_meter: number | null;
  end_meter: number | null;
  kms: number | null;
  test_drive_status: string;
  feedback: string | null;
}

export interface QuotationLineItem {
  id: number;
  vehicle_name: string | null;
  variant_name: string | null;
  color_name: string | null;
  model_year?: string | null;
  vehicle_price?: number | string | null;
  quantity?: number;
  discount?: number | string | null;
}

export interface QuotationItem {
  id: number;
  quotation_no: string | null;
  inquiry_no?: string | null;
  customer_name?: string | null;
  contact_person?: string | null;
  dealer_name?: string | null;
  executive_name?: string | null;
  signatory_name?: string | null;
  customer_display_name?: string | null;
  terms_and_conditions?: string | null;
  approval_status: string | null;
  requires_approval?: boolean;
  requested_approver_name: string | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  rejected_by_name?: string | null;
  rejection_reason: string | null;
  created_at: string;
  remarks: string | null;
  quotation_vehicles: QuotationLineItem[];
}

export interface QuotationVehicleInput {
  vehicle: number;
  vehicle_price?: number | null;
  quantity?: number;
  discount?: number;
}

// POST /crm/quotations/ (web CRM/Inquiry/DetailsTabs/QuotationTabs).
export interface CreateQuotationPayload {
  inquiry: number;
  signatory: number;
  // Required by the backend only once a line item's price differs from its
  // listed price; omitted otherwise.
  requested_approver?: number;
  customer_display_name?: string;
  terms_and_conditions?: string;
  remarks?: string;
  quotation_vehicles: QuotationVehicleInput[];
}

// Used by both /crm/inquiry/{id}/inquiry_documents/ and /crm/inquiry/{id}/sales_documents/.
export interface DocumentItem {
  id: number;
  master_doc: number | null;
  doc: string | null;
  inquiry: number;
  is_sales_document: boolean;
}

// GET /crm/inquiry/{id}/payment_process/ — one row per receipt.
export interface PaymentItem {
  id: number;
  inquiry: number | null;
  payment_type: number | null;
  payment_type_name?: string | null;
  payment_mode: number | null;
  payment_mode_name?: string | null;
  amount: number | string;
  document: string | null;
  receipt_date: string | null;
  payment_information: string | null;
  description: string | null;
  next_installment_date?: string | null;
  fiscal_year: number | null;
}

// POST /crm/payment-process/ (multipart).
export interface CreatePaymentPayload {
  inquiry: number;
  payment_type: number;
  payment_mode: number;
  amount: number;
  receipt_date: string;
  fiscal_year: number;
  payment_information?: string;
  description?: string;
  // Only meaningful for "credit" payment types (web gates on the label).
  next_installment_date?: string;
  document?: UploadFile;
}

// ─── Payment-details tabs (web CRM/Inquiry/PaymentTabs) ──────────────────────

// GET /crm/inquiry/{id}/discount_requests/ — one row per discount request.
export interface DiscountRequestItem {
  id: number;
  inquiry: number;
  requested_discount_amount: number;
  given_discount_amount: number | null;
  status: string;
  remarks: string | null;
  created_at: string;
}

// GET /crm/sales-accessory/?inquiry= — one accessory saved on the deal.
export interface SalesAccessoryItem {
  id: number;
  inquiry: number;
  sparepart: number | null;
  sparepart_name?: string | null;
  part_code?: string | null;
}

// Vehicle snapshot shared by the sale and its assignment request.
export interface SalesVehicleDetails {
  dealer_stock_id: number;
  stock_status: string;
  vehicle_name: string | null;
  variant: string | null;
  color: string | null;
  manufacturing_year: string | null;
  vehicle_type: string | null;
  chassis_number: string | null;
}

// GET /crm/sales-assignment-request/?inquiry=&ordering=-created_at
export interface SalesAssignmentRequestItem {
  id: number;
  inquiry: number;
  dealer_stock_vehicle: number;
  sales_person: number;
  sales_person_name: string | null;
  sales_date: string | null;
  status: string;
  status_display?: string | null;
  rejection_reason?: string | null;
  vehicle_details: SalesVehicleDetails | null;
}

// GET /crm/sales/?inquiry__id= — the real Sale, once an assignment is approved.
export interface SalesRecordItem {
  id: number;
  inquiry: number;
  dealer_stock_vehicle: number;
  actual_price: number | null;
  discount_amount: number | null;
  sold_price: number | null;
  sales_date: string | null;
  sales_person_name: string | null;
  discount_request_details: {
    id: number;
    requested_amount: number;
    approved_amount: number;
    status: string;
    remarks: string | null;
  } | null;
  vehicle_details: {
    dealer_stock_id: number;
    stock_status: string;
    vehicle_name: string | null;
    variant: string | null;
    color: string | null;
    manufacturing_year: string | null;
    vehicle_type: string | null;
    chassis_number: string | null;
    engine_number: string | null;
  } | null;
}

// GET /available-dealer-stock/?dealer_id=&dms_vehicle=&status=STOCK
export interface DealerStockItem {
  id: number;
  chassis_no?: string | null;
  frame_no?: string | null;
  vehicle_type?: string | null;
  dms_vehicle?: {
    vehicle?: { name: string } | null;
    variant?: { name: string } | null;
    color?: { name: string } | null;
    manufacturing_year?: string | number | null;
    vehicle_type?: string | null;
    vehicle_price?:
      | { dealer_price: number; customer_price: number | null }[]
      | null;
  } | null;
}

// POST /crm/inquiry/{id}/discount/ (string amount, as the web sends it).
export interface CreateDiscountPayload {
  discount_amount: number;
}

// POST /crm/discount-request/{id}/update_amount/.
export interface UpdateDiscountPayload {
  amount: number;
}

// POST /crm/sales-accessory/.
export interface CreateSalesAccessoryPayload {
  inquiry: number;
  sparepart: number;
}

// POST /crm/sales-assignment-request/ — the "Assign Stock" submit.
export interface CreateSalesAssignmentRequestPayload {
  inquiry: number;
  dealer_stock_vehicle: number;
  sales_person: number;
  sales_date: string;
  discount_request?: number;
}

// One drawer sub-list per key. The generic fetch thunk switches on this.
export type CustomerResourceKey =
  | "activities"
  | "notes"
  | "statuses"
  | "testDrives"
  | "quotations"
  | "documents"
  | "payments"
  | "discounts"
  | "salesDocuments"
  | "salesAccessories"
  | "salesRecord"
  | "salesAssignment";

export interface CustomerResourceState<T = unknown> {
  items: T[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

// ─── Writes from the action drawer (Phase 3) ──────────────────────────────────
// Payloads mirror the web CRM/Inquiry forms (see CRM/Inquiry/DetailsTabs).
export interface CreateNotePayload {
  inquiry: number;
  note: string;
}

export interface CreateDealStatusPayload {
  inquiry: number;
  status: number;
  sub_status: number | null;
  remarks: string | null;
}

// ─── Pipeline actions (Phase 4) ───────────────────────────────────────────────
// POST /crm/inquiry/{id}/review/ — either voice may be sent alone.
export interface ReviewInquiryPayload {
  salesperson_voice?: string;
  hod_voice?: string;
}

// DMS envelope returned by the pipeline-action POSTs: { data: {...inquiry}, message }.
export type InquiryActionEnvelope = {
  data?: Record<string, any>;
  message?: string;
};

export interface KindChangePayload {
  kind: number;
  note?: string;
}

// POST /crm/inquiry/{id}/convert_to_deal/. IDs are master vehicle/variant/
// color ids; `year` is YYYY-MM-DD.
export interface ConvertToDealPayload {
  vehicle: number;
  variant: number;
  color: number;
  year: string;
  discount_amount?: number;
}

// A file staged for upload, in the shape React Native's FormData wants.
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface BookExchangeVehiclePayload {
  name: string;
  model_year: number;
  valuation_amount: number;
  registration_number: string;
  bluebook_image?: UploadFile;
}

// POST /crm/inquiry/{id}/book/ (multipart).
export interface BookInquiryPayload {
  deal_amount: number;
  booking_amount: number;
  credit_period_days?: number;
  payment_mode: number;
  bank?: string;
  document?: UploadFile;
  notes?: string;
  insurance_covered_by: "company" | "customer";
  insurance_company_name?: string;
  road_tax_covered_by: "company" | "customer";
  route_permit_covered_by: "company" | "customer";
  pan_vat_no?: string;
  exchange_vehicles?: BookExchangeVehiclePayload[];
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
