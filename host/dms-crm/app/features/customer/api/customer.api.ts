import { getApiErrorMessage } from "../../../utils/extractError";
import {
    ActivityItem,
    AddCustomerPayload,
    BookInquiryPayload,
    ConvertToDealPayload,
    CreateDealStatusPayload,
    CreateNotePayload,
    Customer,
    CustomerListParams,
    CustomerListResponse,
    CustomerResourceKey,
    DealStatusItem,
    DocumentItem,
    InquiryActionEnvelope,
    InquiryDetail,
    KindChangePayload,
    MasterItem,
    NoteItem,
    QuotationItem,
    ReviewInquiryPayload,
    TestDriveItem,
} from "../types";
import { FollowupPayload } from "../../ccd/types";
import { apiClient } from "../../../../../../app/services/axios";

// Normalises the two response envelopes the inquiry sub-resource endpoints use:
// {data: ...} for activities/notes, and DRF's {results: []} for the rest.
type ResourceResult = {
  success: boolean;
  items?: unknown[];
  message?: string;
};

// DMS envelope used by the pipeline-action POSTs: { data: {...inquiry}, message }.
type ActionEnvelope = InquiryActionEnvelope;

export const customerApi = {
  async fetchCustomers(params?: CustomerListParams): Promise<{
    success: boolean;
    data?: CustomerListResponse;
    message?: string;
  }> {
    const response = await apiClient.get<CustomerListResponse>(
      "/crm/inquiry/",
      { params },
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customers"),
    };
  },

  async fetchCustomerById(id: string): Promise<{
    success: boolean;
    data?: Customer;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: Customer }>(
      `/crm/inquiry/${id}/`,
    );
    if (response.success && response.data) {
      return { success: true, data: response.data.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customer"),
    };
  },

  async fetchInquiryDetail(id: string): Promise<{
    success: boolean;
    data?: InquiryDetail;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: InquiryDetail }>(
      `/inquiry/${id}/detail/`,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch inquiry details"),
    };
  },

  // Read-only lists for the customer action drawer. Kept in one method so the
  // drawer needs a single thunk; the endpoint + envelope differ per key.
  async fetchInquiryResource(
    key: CustomerResourceKey,
    inquiryId: string | number,
  ): Promise<ResourceResult> {
    const id = String(inquiryId);

    switch (key) {
      case "activities": {
        const response = await apiClient.get<{
          data: ActivityItem | ActivityItem[] | null;
        }>(`/crm/inquiry/${id}/activities/`);
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load activities"),
          };
        }
        const data = response.data.data;
        return {
          success: true,
          items: Array.isArray(data) ? data : data ? [data] : [],
        };
      }

      case "notes": {
        const response = await apiClient.get<{ data: NoteItem[] }>(
          `/crm/inquiry/${id}/Note/`,
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load notes"),
          };
        }
        return { success: true, items: response.data.data ?? [] };
      }

      case "statuses": {
        const response = await apiClient.get<{ results: DealStatusItem[] }>(
          "/crm/deal-status/",
          { params: { inquiry__id: id, ordering: "-created_at" } },
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load deal status"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "testDrives": {
        const response = await apiClient.get<{ results: TestDriveItem[] }>(
          `/crm/inquiry/${id}/test_drive/`,
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load test drives"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "quotations": {
        const response = await apiClient.get<{ results: QuotationItem[] }>(
          "/crm/quotations/",
          { params: { inquiry: id } },
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load quotations"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "documents": {
        const response = await apiClient.get<{ results: DocumentItem[] }>(
          `/crm/inquiry/${id}/inquiry_documents/`,
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load documents"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }
    }
  },

  async createCustomer(payload: AddCustomerPayload): Promise<{
    success: boolean;
    data?: Customer;
    message?: string;
  }> {
    console.log(
      "[customerApi.createCustomer] REQUEST → POST /crm/inquiry/",
      JSON.stringify(payload, null, 2),
    );
    const response = await apiClient.post<Customer>("/crm/inquiry/", payload);
    console.log(
      "[customerApi.createCustomer] RESPONSE ←",
      JSON.stringify(response, null, 2),
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create customer"),
    };
  },

  // PATCH /crm/inquiry/{id}/ — Edit Customer (Phase 5). Same payload shape the
  // create call uses; DRF treats absent keys as "leave unchanged".
  async updateInquiry(
    id: string | number,
    payload: AddCustomerPayload,
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.patch(`/crm/inquiry/${id}/`, payload);
    if (response.success) return { success: true };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to update customer"),
    };
  },

  // ─── Writes from the action drawer (Phase 3) ────────────────────────────────
  async createInquiryNote(payload: CreateNotePayload): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> {
    const response = await apiClient.post("/crm/inquiry-note/", payload);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to add note"),
    };
  },

  async createInquiryFollowup(payload: FollowupPayload): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> {
    const response = await apiClient.post("/crm/followup/", payload);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create activity"),
    };
  },

  async createInquiryDealStatus(payload: CreateDealStatusPayload): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> {
    const response = await apiClient.post("/crm/deal-status/", payload);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create deal status"),
    };
  },

  // Deal-status form dropdown options. Kept here so the drawer feature owns the
  // endpoints it needs instead of reaching into the master store.
  async fetchMasterStatuses(): Promise<{
    success: boolean;
    data?: MasterItem[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterItem[] }>(
      "/master-status/",
    );
    if (response.success && response.data) {
      return { success: true, data: response.data.results ?? [] };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to load statuses"),
    };
  },

  async fetchMasterSubStatuses(): Promise<{
    success: boolean;
    data?: MasterItem[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterItem[] }>(
      "/master-sub-status/",
    );
    if (response.success && response.data) {
      return { success: true, data: response.data.results ?? [] };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to load sub-statuses"),
    };
  },

  // ─── Pipeline actions (Phase 4) ─────────────────────────────────────────────
  // Each returns the raw DMS envelope ({ data: {...inquiry}, message }) so the
  // caller can read the *_approval_status and tell "applied" from "pending".
  async reviewInquiry(
    id: string | number,
    payload: ReviewInquiryPayload,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/review/`,
      payload,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to save review"),
    };
  },

  async revertInquiryStage(
    id: string | number,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/revert-stage/`,
      null,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to revert stage"),
    };
  },

  async requestInquiryClosure(
    id: string | number,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/request-closure/`,
      null,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to request closure"),
    };
  },

  async requestInquiryKindChange(
    id: string | number,
    payload: KindChangePayload,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/request-kind-change/`,
      payload,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to change kind"),
    };
  },

  async cancelInquiryKindChange(
    id: string | number,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/cancel-kind-change/`,
      null,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to cancel kind change"),
    };
  },

  async convertInquiry(
    id: string | number,
    payload: ConvertToDealPayload,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/convert_to_deal/`,
      payload,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to convert to deal"),
    };
  },

  // The thunk builds the FormData (it needs the staged file URIs); this just
  // posts it as multipart so axios doesn't JSON-encode it.
  async bookInquiry(
    id: string | number,
    formData: FormData,
  ): Promise<{ success: boolean; data?: ActionEnvelope; message?: string }> {
    const response = await apiClient.post<ActionEnvelope>(
      `/crm/inquiry/${id}/book/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to book inquiry"),
    };
  },
};
