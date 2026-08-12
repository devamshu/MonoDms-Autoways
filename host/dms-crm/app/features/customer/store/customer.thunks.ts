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
      // Transform to API payload format
      const payload: AddCustomerPayload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name,
        gender: formData.gender,
        // Omitted when empty, like the fields around it. Sending "" trips the
        // serializer's allow_blank=False and 400s with
        // "This field may not be blank."
        address: formData.address || undefined,
        ...(formData.country && { country: parseInt(formData.country, 10) }),
        ...(formData.city && { city: parseInt(formData.city, 10) }),
        phone: phoneEntries.map(
          (p): AddCustomerPhonePayload => ({
            category: p.category,
            phone: p.phone,
            country_code: p.country_code,
            relation: p.relation,
          }),
        ),
        email: emailEntries.map(
          (e): AddCustomerEmailPayload => ({
            category: e.category,
            email: e.email,
            relation: e.relation,
          }),
        ),
        // API expects an array of DMS-vehicle ids under `vehicle`; each staged
        // vehicle already carries the resolved DMS record id.
        vehicle: vehicleEntries.map((v) => v.dmsId),
        inquiry_source: parseInt(formData.source_type, 10),
        kind: parseInt(formData.inquiry_kind, 10),
        remarks: formData.remarks || undefined,
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
