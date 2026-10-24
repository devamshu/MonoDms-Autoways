import { getApiErrorMessage } from "../../../utils/extractError";
import {
    ActivityItem,
    AddCustomerPayload,
    BookInquiryPayload,
    ConvertToDealPayload,
    CreateDealStatusPayload,
    CreateDiscountPayload,
    CreateNotePayload,
    CreatePaymentPayload,
    CreateQuotationPayload,
    CreateSalesAccessoryPayload,
    CreateSalesAssignmentRequestPayload,
    CreateTestDrivePayload,
    Customer,
    CustomerListParams,
    CustomerListResponse,
    CustomerResourceKey,
    DealStatusItem,
    DealerStockItem,
    DiscountRequestItem,
    DocumentItem,
    InquiryActionEnvelope,
    InquiryDetail,
    KindChangePayload,
    MasterItem,
    NoteItem,
    PaymentItem,
    QuotationItem,
    ReviewInquiryPayload,
    TestDriveItem,
    UpdateDiscountPayload,
} from "../types";
import { FollowupPayload } from "../../ccd/types";
import { apiClient } from "../../../../../../app/services/axios";
import { downloadAndShareFile } from "../../../../../../app/utils/downloadFile";

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

      case "payments": {
        const response = await apiClient.get<
          { results: PaymentItem[] } | PaymentItem[]
        >(`/crm/inquiry/${id}/payment_process/`);
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load payments"),
          };
        }
        const payload = response.data;
        return {
          success: true,
          items: Array.isArray(payload) ? payload : payload.results ?? [],
        };
      }

      case "discounts": {
        const response = await apiClient.get<
          { data: DiscountRequestItem[] } | DiscountRequestItem[]
        >(`/crm/inquiry/${id}/discount_requests/`);
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load discounts"),
          };
        }
        const payload = response.data;
        return {
          success: true,
          items: Array.isArray(payload) ? payload : payload.data ?? [],
        };
      }

      case "salesDocuments": {
        const response = await apiClient.get<{ results: DocumentItem[] }>(
          `/crm/inquiry/${id}/sales_documents/`,
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(
              response,
              "Failed to load sales documents",
            ),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "salesAccessories": {
        const response = await apiClient.get<{
          results: unknown[];
        }>("/crm/sales-accessory/", {
          params: { inquiry: id, page_size: 1000 },
        });
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load accessories"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "salesRecord": {
        const response = await apiClient.get<{ results: unknown[] }>(
          "/crm/sales/",
          { params: { inquiry__id: id, page_size: 1 } },
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(response, "Failed to load sale"),
          };
        }
        return { success: true, items: response.data.results ?? [] };
      }

      case "salesAssignment": {
        const response = await apiClient.get<{ results: unknown[] }>(
          "/crm/sales-assignment-request/",
          { params: { inquiry: id, page_size: 1, ordering: "-created_at" } },
        );
        if (!response.success || !response.data) {
          return {
            success: false,
            message: getApiErrorMessage(
              response,
              "Failed to load stock assignment",
            ),
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
    const response = await apiClient.post<Customer>("/crm/inquiry/", payload);
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

  // The thunk builds the FormData (it needs the receipt file URI); this just
  // posts it as multipart so axios doesn't JSON-encode it.
  async createInquiryPayment(formData: FormData): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> {
    const response = await apiClient.post("/crm/payment-process/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to add payment"),
    };
  },

  // ─── Payment-details writes (web CRM/Inquiry/PaymentTabs) ───────────────────

  // POST /crm/inquiry/{id}/discount/ — the backend decides apply-vs-pending and
  // reports which in data.status ("approved" | "pending").
  async createDiscountRequest(
    id: string | number,
    payload: CreateDiscountPayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(`/crm/inquiry/${id}/discount/`, {
      discount_amount: String(payload.discount_amount),
    });
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to request discount"),
    };
  },

  // POST /crm/discount-request/{id}/update_amount/ — edit a still-pending request.
  async updateDiscountRequest(
    requestId: string | number,
    payload: UpdateDiscountPayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(
      `/crm/discount-request/${requestId}/update_amount/`,
      { amount: String(payload.amount) },
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to update discount"),
    };
  },

  // POST /crm/test-drive/ — schedules a test drive on a dealer-stock vehicle.
  async createTestDrive(
    payload: CreateTestDrivePayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post("/crm/test-drive/", payload);
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to schedule test drive"),
    };
  },

  // POST /crm/quotations/ — creates a multi-vehicle quotation.
  async createQuotation(
    payload: CreateQuotationPayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post("/crm/quotations/", payload);
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create quotation"),
    };
  },

  // GET /crm/quotations/{id}/download-quotation-pdf/ — auth-protected binary.
  // Downloaded to the cache and offered through the OS share sheet.
  async downloadQuotationPdf(id: number | string): Promise<{
    success: boolean;
    uri?: string;
    message?: string;
  }> {
    return downloadAndShareFile(
      `/crm/quotations/${id}/download-quotation-pdf/`,
      `quotation-${id}.pdf`,
    );
  },

  // POST /crm/document/ (multipart) — sales-document upload. The thunk builds
  // the FormData (it carries the picked file).
  async uploadSalesDocument(formData: FormData): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> {
    const response = await apiClient.post("/crm/document/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to upload document"),
    };
  },

  async createSalesAccessory(
    payload: CreateSalesAccessoryPayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post("/crm/sales-accessory/", payload);
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to save accessory"),
    };
  },

  // POST /crm/sales-assignment-request/ — creates a *request* (no Sale yet);
  // approval turns it into the Sale.
  async createSalesAssignmentRequest(
    payload: CreateSalesAssignmentRequestPayload,
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const response = await apiClient.post(
      "/crm/sales-assignment-request/",
      payload,
    );
    if (response.success) return { success: true, data: response.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to submit stock assignment",
      ),
    };
  },

  // GET /available-dealer-stock/ — filtered server-side by dealer + agreed
  // vehicle spec, matching the web's stock lookup. The test-drive picker omits
  // the vehicle spec and relies on the picker's client-side search.
  async fetchAvailableDealerStock(
    dealerId: string | number,
    dmsVehicleId?: string | number,
  ): Promise<{ success: boolean; data?: DealerStockItem[]; message?: string }> {
    const response = await apiClient.get<{ results: DealerStockItem[] }>(
      "/available-dealer-stock/",
      {
        params: {
          page: 1,
          page_size: 100,
          status: "STOCK",
          dealer_id: dealerId,
          ...(dmsVehicleId != null ? { dms_vehicle: dmsVehicleId } : {}),
        },
      },
    );
    if (response.success && response.data) {
      return { success: true, data: response.data.results ?? [] };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to load stock"),
    };
  },
};
