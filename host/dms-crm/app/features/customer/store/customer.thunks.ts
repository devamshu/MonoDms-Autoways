import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { customerApi } from "../api/customer.api";
import {
  AddCustomerEmailPayload,
  AddCustomerPayload,
  AddCustomerPhonePayload,
  BookInquiryPayload,
  ConvertToDealPayload,
  CreateDealStatusPayload,
  CreatePaymentPayload,
  CreateQuotationPayload,
  CreateSalesAssignmentRequestPayload,
  CreateTestDrivePayload,
  Customer,
  CustomerFormData,
  CustomerListParams,
  CustomerListResponse,
  CustomerResourceKey,
  EmailEntry,
  InquiryActionEnvelope,
  InquiryDetail,
  KindChangePayload,
  PhoneEntry,
  ReviewInquiryPayload,
  StagedVehicle,
  UploadFile,
} from "../types";
import { FollowupPayload } from "../../ccd/types";

export const fetchCustomers = createAsyncThunk<
  CustomerListResponse,
  CustomerListParams | undefined,
  { rejectValue: string }
>("customer/fetchCustomers", async (params, { rejectWithValue }) => {
  try {
    const response = await customerApi.fetchCustomers(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch customers");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const response = await customerApi.fetchCustomerById(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch customer");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  AddCustomerPayload,
  { rejectValue: string }
>("customer/createCustomer", async (payload, { rejectWithValue }) => {
  try {
    const response = await customerApi.createCustomer(payload);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to create customer");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchInquiryDetail = createAsyncThunk<
  InquiryDetail,
  string,
  { rejectValue: string }
>("customer/fetchInquiryDetail", async (id, { rejectWithValue }) => {
  try {
    const response = await customerApi.fetchInquiryDetail(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch inquiry details",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ─── Writes from the action drawer (Phase 3) ──────────────────────────────────
// Each write refreshes only the sub-list it changed, so the rest of the drawer
// and the customer list behind it keep their state.

export const createInquiryNote = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; note: string },
  { rejectValue: string }
>(
  "customer/createInquiryNote",
  async ({ inquiryId, note }, { dispatch, rejectWithValue }) => {
    try {
      const response = await customerApi.createInquiryNote({
        inquiry: Number(inquiryId),
        note,
      });
      if (response.success) {
        dispatch(fetchInquiryResource({ inquiryId, key: "notes" }));
        return { inquiryId };
      }
      return rejectWithValue(response.message || "Failed to add note");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createInquiryFollowup = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: FollowupPayload },
  { rejectValue: string }
>("customer/createInquiryFollowup", async ({ inquiryId, payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.createInquiryFollowup(payload);
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "activities" }));
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to create activity");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createInquiryDealStatus = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: CreateDealStatusPayload },
  { rejectValue: string }
>("customer/createInquiryDealStatus", async ({ inquiryId, payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.createInquiryDealStatus(payload);
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "statuses" }));
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to create deal status");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
// ─── Pipeline actions (Phase 4) ───────────────────────────────────────────────
// Each refreshes the customer list with the table's last params (status/kind
// badges change) and returns the raw envelope so the caller can read the
// *_approval_status and show "applied" vs "pending".

const refetchCustomerList = (getState: () => unknown, dispatch: (a: any) => void) => {
  const { listParams } = (
    getState() as { crmCustomer: { listParams: CustomerListParams | null } }
  ).crmCustomer;
  dispatch(fetchCustomers(listParams ?? undefined));
};

export const reviewInquiry = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number; payload: ReviewInquiryPayload },
  { rejectValue: string }
>("customer/reviewInquiry", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.reviewInquiry(inquiryId, payload);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to save review");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const revertInquiryStage = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number },
  { rejectValue: string }
>("customer/revertInquiryStage", async ({ inquiryId }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.revertInquiryStage(inquiryId);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to revert stage");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const requestInquiryClosure = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number },
  { rejectValue: string }
>("customer/requestInquiryClosure", async ({ inquiryId }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.requestInquiryClosure(inquiryId);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to request closure");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const requestInquiryKindChange = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number; payload: KindChangePayload },
  { rejectValue: string }
>("customer/requestInquiryKindChange", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.requestInquiryKindChange(inquiryId, payload);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to change kind");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const cancelInquiryKindChange = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number },
  { rejectValue: string }
>("customer/cancelInquiryKindChange", async ({ inquiryId }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.cancelInquiryKindChange(inquiryId);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to cancel kind change");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const convertInquiry = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number; payload: ConvertToDealPayload },
  { rejectValue: string }
>("customer/convertInquiry", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.convertInquiry(inquiryId, payload);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to convert to deal");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Flattens the booking payload into multipart the way the web's `toFormData`
// does: files go through as RN `{uri,name,type}` objects, exchange vehicles as
// `exchange_vehicles[i][field]`.
function buildBookFormData(payload: BookInquiryPayload): FormData {
  const fd = new FormData();
  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, String(value));
  };
  append("deal_amount", payload.deal_amount);
  append("booking_amount", payload.booking_amount);
  append("credit_period_days", payload.credit_period_days);
  append("payment_mode", payload.payment_mode);
  append("bank", payload.bank);
  append("notes", payload.notes);
  append("insurance_covered_by", payload.insurance_covered_by);
  append("insurance_company_name", payload.insurance_company_name);
  append("road_tax_covered_by", payload.road_tax_covered_by);
  append("route_permit_covered_by", payload.route_permit_covered_by);
  append("pan_vat_no", payload.pan_vat_no);
  if (payload.document) {
    fd.append("document", payload.document as any);
  }
  (payload.exchange_vehicles ?? []).forEach((vehicle, index) => {
    fd.append(`exchange_vehicles[${index}][name]`, vehicle.name);
    fd.append(`exchange_vehicles[${index}][model_year]`, String(vehicle.model_year));
    fd.append(
      `exchange_vehicles[${index}][valuation_amount]`,
      String(vehicle.valuation_amount),
    );
    fd.append(
      `exchange_vehicles[${index}][registration_number]`,
      vehicle.registration_number,
    );
    if (vehicle.bluebook_image) {
      fd.append(
        `exchange_vehicles[${index}][bluebook_image]`,
        vehicle.bluebook_image as any,
      );
    }
  });
  return fd;
}

export const bookInquiry = createAsyncThunk<
  InquiryActionEnvelope | undefined,
  { inquiryId: string | number; payload: BookInquiryPayload },
  { rejectValue: string }
>("customer/bookInquiry", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.bookInquiry(
      inquiryId,
      buildBookFormData(payload),
    );
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to book inquiry");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// POST /crm/payment-process/ (multipart). The receipt file, if any, rides along
// as an RN `{uri,name,type}` object like the booking document does.
function buildPaymentFormData(payload: CreatePaymentPayload): FormData {
  const fd = new FormData();
  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, String(value));
  };
  append("inquiry", payload.inquiry);
  append("payment_type", payload.payment_type);
  append("payment_mode", payload.payment_mode);
  append("amount", payload.amount);
  append("receipt_date", payload.receipt_date);
  append("fiscal_year", payload.fiscal_year);
  append("payment_information", payload.payment_information);
  append("description", payload.description);
  append("next_installment_date", payload.next_installment_date);
  if (payload.document) fd.append("document", payload.document as any);
  return fd;
}

export const createInquiryPayment = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: CreatePaymentPayload },
  { rejectValue: string }
>("customer/createInquiryPayment", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.createInquiryPayment(
      buildPaymentFormData(payload),
    );
    if (response.success) {
      // Payments list and the row's total_payments_made both move.
      dispatch(fetchInquiryResource({ inquiryId, key: "payments" }));
      refetchCustomerList(getState, dispatch);
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to add payment");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ─── Payment-details writes (web CRM/Inquiry/PaymentTabs) ─────────────────────

// POST /crm/inquiry/{id}/discount/ — raises/updates a discount request. The
// backend decides whether it applies immediately; returns that status.
export const createInquiryDiscount = createAsyncThunk<
  { inquiryId: string | number; applied: boolean },
  { inquiryId: string | number; amount: number },
  { rejectValue: string }
>("customer/createInquiryDiscount", async ({ inquiryId, amount }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.createDiscountRequest(inquiryId, {
      discount_amount: amount,
    });
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "discounts" }));
      const data = (response.data as { data?: { status?: string } } | undefined)
        ?.data;
      return { inquiryId, applied: data?.status === "approved" };
    }
    return rejectWithValue(response.message || "Failed to request discount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// POST /crm/discount-request/{id}/update_amount/ — edit a pending request.
export const updateInquiryDiscount = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; requestId: number; amount: number },
  { rejectValue: string }
>("customer/updateInquiryDiscount", async ({ inquiryId, requestId, amount }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.updateDiscountRequest(requestId, {
      amount,
    });
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "discounts" }));
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to update discount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// POST /crm/document/ (multipart) — sales-document upload. `is_sales_document`
// is what puts the row in /crm/inquiry/{id}/sales_documents/.
export const uploadSalesDocument = createAsyncThunk<
  { inquiryId: string | number },
  {
    inquiryId: string | number;
    masterDoc: number;
    file: UploadFile;
    isSalesDocument: boolean;
  },
  { rejectValue: string }
>("customer/uploadSalesDocument", async ({ inquiryId, masterDoc, file, isSalesDocument }, { dispatch, rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append("master_doc", String(masterDoc));
    fd.append("inquiry", String(Number(inquiryId)));
    fd.append("is_sales_document", String(isSalesDocument));
    fd.append("doc", file as any);

    const response = await customerApi.uploadSalesDocument(fd);
    if (response.success) {
      // A sales document lands in /sales_documents/, a plain one in
      // /inquiry_documents/ — refresh the list the row actually joins.
      dispatch(
        fetchInquiryResource({
          inquiryId,
          key: isSalesDocument ? "salesDocuments" : "documents",
        }),
      );
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to upload document");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// POST /crm/test-drive/ — schedules a test drive, then refreshes the list.
export const createInquiryTestDrive = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: CreateTestDrivePayload },
  { rejectValue: string }
>("customer/createInquiryTestDrive", async ({ inquiryId, payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.createTestDrive(payload);
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "testDrives" }));
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to schedule test drive");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// POST /crm/quotations/ — creates a quotation, then refreshes the list.
export const createInquiryQuotation = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: CreateQuotationPayload },
  { rejectValue: string }
>("customer/createInquiryQuotation", async ({ inquiryId, payload }, { dispatch, rejectWithValue }) => {
  try {
    const response = await customerApi.createQuotation(payload);
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "quotations" }));
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to create quotation");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// "Assign Stock": saves each accessory row, then raises the sales-assignment
// request. Mirrors the web submitAssignStock ordering (accessories first).
export const submitSalesAssignment = createAsyncThunk<
  { inquiryId: string | number },
  {
    inquiryId: string | number;
    payload: CreateSalesAssignmentRequestPayload;
    sparepartIds: number[];
  },
  { rejectValue: string }
>("customer/submitSalesAssignment", async ({ inquiryId, payload, sparepartIds }, { dispatch, getState, rejectWithValue }) => {
  try {
    await Promise.all(
      sparepartIds.map((sparepart) =>
        customerApi.createSalesAccessory({
          inquiry: Number(inquiryId),
          sparepart,
        }),
      ),
    );

    const response = await customerApi.createSalesAssignmentRequest(payload);
    if (response.success) {
      dispatch(fetchInquiryResource({ inquiryId, key: "salesAccessories" }));
      dispatch(fetchInquiryResource({ inquiryId, key: "salesAssignment" }));
      dispatch(fetchInquiryResource({ inquiryId, key: "salesRecord" }));
      refetchCustomerList(getState, dispatch);
      return { inquiryId };
    }
    return rejectWithValue(
      response.message || "Failed to submit sales assignment",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// PATCH /crm/inquiry/{id}/ — Edit Customer (Phase 5). Refreshes the list so the
// edited row reflects the change behind the closed drawer.
export const updateInquiry = createAsyncThunk<
  { inquiryId: string | number },
  { inquiryId: string | number; payload: AddCustomerPayload },
  { rejectValue: string }
>("customer/updateInquiry", async ({ inquiryId, payload }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await customerApi.updateInquiry(inquiryId, payload);
    if (response.success) {
      refetchCustomerList(getState, dispatch);
      return { inquiryId };
    }
    return rejectWithValue(response.message || "Failed to update customer");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchInquiryResource = createAsyncThunk<
  { key: CustomerResourceKey; items: unknown[] },
  { inquiryId: string | number; key: CustomerResourceKey },
  { rejectValue: string }
>("customer/fetchInquiryResource", async ({ inquiryId, key }, { rejectWithValue }) => {
  try {
    const response = await customerApi.fetchInquiryResource(key, inquiryId);
    if (response.success) return { key, items: response.items ?? [] };
    return rejectWithValue(response.message || "Failed to load");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const submitMultiStepForm = createAsyncThunk<
  Customer,
  {
    formData: CustomerFormData;
    phoneEntries: PhoneEntry[];
    emailEntries: EmailEntry[];
    vehicleEntries: StagedVehicle[];
  },
  { rejectValue: string }
>(
  "customer/submitMultiStepForm",
  async (
    { formData, phoneEntries, emailEntries, vehicleEntries },
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as any;
      const profile = state.crmProfile?.profile;

      const assignedTo = formData.assigned_to
        ? parseInt(formData.assigned_to, 10)
        : profile?.id ?? undefined;

      const emails = emailEntries
        .filter((e) => e.email.trim())
        .map(
          (e): AddCustomerEmailPayload => ({
            category: e.category,
            email: e.email,
            relation: e.relation,
          }),
        );

      const payload: AddCustomerPayload = {
        name: formData.name,
        address: formData.address || undefined,
        ...(formData.city && { city: parseInt(formData.city, 10) }),
        phone: phoneEntries.map(
          (p): AddCustomerPhonePayload => ({
            category: p.category,
            phone: p.phone,
            country_code: p.country_code,
            relation: p.relation,
          }),
        ),
        ...(emails.length > 0 && { email: emails }),
        vehicle: vehicleEntries.map((v) => v.dmsId),
        inquiry_source: parseInt(formData.source_type, 10),
        kind: parseInt(formData.inquiry_kind, 10),
        remarks: formData.remarks || undefined,
        ...(assignedTo && { assigned_to: assignedTo }),
      };

      const response = await customerApi.createCustomer(payload);

      if (response.success && response.data) {
        // Centralized refetch: refresh the list using the same params the
        // table last fetched with, so the new customer shows without the
        // screen having to wire up its own refresh.
        const { listParams } = (
          getState() as {
            crmCustomer: { listParams: CustomerListParams | null };
          }
        ).crmCustomer;
        dispatch(fetchCustomers(listParams ?? undefined));
        return response.data;
      }

      return rejectWithValue(response.message || "Failed to create customer");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
