import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { customerApi } from "../api/customer.api";
import {
  AddCustomerEmailPayload,
  AddCustomerPayload,
  AddCustomerPhonePayload,
  Customer,
  CustomerFormData,
  CustomerListParams,
  CustomerListResponse,
  EmailEntry,
  InquiryDetail,
  PhoneEntry,
  StagedVehicle,
} from "../types";

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
