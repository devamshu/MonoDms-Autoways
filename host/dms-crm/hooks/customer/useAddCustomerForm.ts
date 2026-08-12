import { createCustomer } from "@/app/features/customer/store/customer.thunks";
import {
  AddCustomerEmailPayload,
  AddCustomerPayload,
  AddCustomerPhonePayload,
  CustomerFormData,
  EmailEntry,
  PhoneEntry,
  VehicleEntry,
} from "@/app/features/customer/types";
import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useState } from "react";

export const INITIAL_FORM: CustomerFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  inquiry_kind: "",
  gender: "",
  address: "",
  country: "",
  city: "",
  source_type: "",
  remarks: "",
  phone: "",
  phone_category: "mobile",
  country_code: "+977",
  email: "",
  email_category: "personal",
  pref_vehicle: "",
  pref_variant: "",
  pref_color: "",
  existing_vehicle_name: "",
  our_vehicle_name: "",
  existing_vehicle_count: "",
  our_vehicle_count: "",
};

const INITIAL_PHONE: PhoneEntry[] = [
  { id: "phone-1", category: "mobile", phone: "", country_code: "+977", relation: 1 },
];

const INITIAL_EMAIL: EmailEntry[] = [
  { id: "email-1", category: "personal", email: "", relation: 1 },
];

export const TOTAL_STEPS = 3;

export function useAddCustomerForm(onClose: () => void) {
  const dispatch = useAppDispatch();
  const { createLoading, createError } = useAppSelector((s) => s.customer);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CustomerFormData>(INITIAL_FORM);
  const [vehicleEntries, setVehicleEntries] = useState<VehicleEntry[]>([]);
  const [addVehicle, setAddVehicle] = useState(false);
  const [phoneEntries, setPhoneEntries] = useState<PhoneEntry[]>(INITIAL_PHONE);
  const [emailEntries, setEmailEntries] = useState<EmailEntry[]>(INITIAL_EMAIL);

  const handleChange = (key: keyof CustomerFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else void handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else onClose();
  };

  const buildPayload = (): AddCustomerPayload => {
    // Use phoneEntries array (Step 3) — filter out empty entries
    const phones: AddCustomerPhonePayload[] = phoneEntries
      .filter((e) => e.phone.trim())
      .map(({ id: _id, ...rest }) => rest);

    // Use emailEntries array (Step 3) — filter out empty entries
    const emails: AddCustomerEmailPayload[] = emailEntries
      .filter((e) => e.email.trim())
      .map(({ id: _id, ...rest }) => rest);

    // API expects an array of master-vehicle ids under `vehicle`.
    const vehicles =
      addVehicle && vehicleEntries.length > 0
        ? vehicleEntries
            .filter((e) => e.vehicle)
            .map((e) => Number(e.vehicle))
        : [];

    return {
      first_name: form.first_name,
      ...(form.middle_name && { middle_name: form.middle_name }),
      last_name: form.last_name,
      gender: form.gender,
      // Omitted when empty, like every other optional below. Sending "" trips
      // the serializer's allow_blank=False and 400s with
      // "This field may not be blank."
      ...(form.address && { address: form.address }),
      phone: phones,
      email: emails,
      vehicle: vehicles,
      inquiry_source: Number(form.source_type),
      kind: Number(form.inquiry_kind),
      ...(form.remarks && { remarks: form.remarks }),
      ...(form.existing_vehicle_name && {
        existing_vehicle_name: form.existing_vehicle_name,
      }),
      ...(form.our_vehicle_name && {
        our_vehicle_name: form.our_vehicle_name,
      }),
      ...(form.existing_vehicle_count && {
        existing_vehicle_count: Number(form.existing_vehicle_count),
      }),
      ...(form.our_vehicle_count && {
        our_vehicle_count: Number(form.our_vehicle_count),
      }),
    };
  };

  const handleSubmit = async () => {
    const result = await dispatch(createCustomer(buildPayload()));
    if (createCustomer.fulfilled.match(result)) {
      onClose();
      return true;
    }
    return false;
  };

  // New function that returns success status
  const submitForm = async (): Promise<boolean> => {
    const result = await dispatch(createCustomer(buildPayload()));
    if (createCustomer.fulfilled.match(result)) {
      return true;
    }
    return false;
  };

  return {
    step,
    form,
    vehicleEntries,
    addVehicle,
    phoneEntries,
    emailEntries,
    isSubmitting: createLoading,
    createError,
    totalSteps: TOTAL_STEPS,
    handleChange,
    handleNext,
    handleBack,
    setVehicleEntries,
    setAddVehicle,
    setPhoneEntries,
    setEmailEntries,
    submitForm, // Export the new function
  };
}
