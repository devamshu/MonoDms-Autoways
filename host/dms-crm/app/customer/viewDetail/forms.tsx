import { useEffect, useMemo, useState, type ReactNode } from "react";
import { shallowEqual } from "react-redux";
import { Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { toast } from "../../../components/custom/toast";
import { AppInput } from "../../../components/custom/input";
import { DatePicker } from "../../../components/custom/datePicker";
import { Dropdown, type DropdownOption } from "../../../components/custom/dropdown";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { RadioGroup } from "../../../components/custom/radioGroup";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { CustomerStepperThree } from "../../../components/custom/customer/customerStepperThree";
import { VehicleCascade } from "../../../components/custom/customer/vehicleCascade";
import { useEmployees } from "../../../hooks/useEmployees";
import { formatNpr } from "../../utils/format/format";
import { customerApi } from "../../features/customer/api/customer.api";
import { masterApi } from "../../features/master/api/master.api";
import {
  bookInquiry,
  convertInquiry,
  createInquiryDealStatus,
  createInquiryFollowup,
  createInquiryNote,
  createInquiryPayment,
  createInquiryQuotation,
  createInquiryTestDrive,
  fetchCustomerById,
  requestInquiryKindChange,
  reviewInquiry,
  updateInquiry,
  uploadSalesDocument,
} from "../../features/customer/store/customer.thunks";
import {
  fetchDmsVehiclesForVehicle,
  fetchMasterCities,
  fetchMasterInquiryKinds,
  fetchMasterSourceTypes,
  fetchMasterVehicles,
} from "../../features/master/store/master.thunks";
import { resetDmsVehicles } from "../../../app/features/master/store/master.slice";
import type { FieldErrors } from "../../features/customer/validation";
import type {
  AddCustomerEmailPayload,
  AddCustomerPayload,
  AddCustomerPhonePayload,
  BookInquiryPayload,
  ConvertToDealPayload,
  CreatePaymentPayload,
  CreateQuotationPayload,
  CreateTestDrivePayload,
  Customer,
  CustomerFormData,
  DealerStockItem,
  EmailEntry,
  PhoneEntry,
  StagedVehicle,
  UploadFile,
  VehicleDetail,
} from "../../features/customer/types";
import type {
  DmsVehicle,
  MasterDocumentMaster,
  MasterInquiryKind,
  MasterOption,
} from "../../features/master/types";
import type { FollowupPayload } from "../../features/ccd/types";

// Mirrors the web CRM/Inquiry forms (DetailsTabs). The drawer owns the scroll,
// so these render fields only — Save is inline and the back arrow cancels.

const FOLLOWUP_TYPE_OPTIONS: DropdownOption[] = [
  { label: "Call", value: "Call" },
  { label: "Email", value: "Email" },
  { label: "SMS", value: "SMS" },
  { label: "Meeting", value: "Meeting" },
];

const PRIORITY_OPTIONS: DropdownOption[] = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const toDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toOption = (item: { id: number; name: string }): DropdownOption => ({
  label: item.name,
  value: String(item.id),
});

const errorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message) || fallback;
  }
  return fallback;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <YStack gap="$2">
      {required ? (
        <RequiredLabel>{label}</RequiredLabel>
      ) : (
        <Text fontSize="$3" fontWeight="500" color="$color">
          {label}
        </Text>
      )}
      {children}
    </YStack>
  );
}

function SubmitButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress}
      disabled={loading}
      backgroundColor="$primary"
      height={48}
      borderRadius={12}
      pressStyle={{ opacity: 0.8 }}
    >
      <Text color="white" fontWeight="600">
        {loading ? "Saving..." : label}
      </Text>
    </Button>
  );
}

export function AddNoteForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!note.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        createInquiryNote({ inquiryId, note: note.trim() }),
      ).unwrap();
      toast.success("Note added successfully");
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add note"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Note" required>
        <AppInput
          placeholder="Write a note"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          height={120}
        />
      </Field>
      <SubmitButton label="Add Note" loading={loading} onPress={submit} />
    </YStack>
  );
}

export function AddActivityForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    followup_type: "",
    priority: "",
    followup_date: "",
    next_followup_date: "",
    time: "",
    followup_details: "",
  });
  const [dateOpen, setDateOpen] = useState<
    "followup_date" | "next_followup_date" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = Object.values(form).every((v) => v.trim().length > 0);

  const submit = async () => {
    if (!canSubmit) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload: FollowupPayload = {
      inquiry: Number(inquiryId),
      followup_date: form.followup_date,
      followup_date_np: form.followup_date,
      next_followup_date: form.next_followup_date,
      next_followup_date_np: form.next_followup_date,
      time: form.time.length === 5 ? `${form.time}:00` : form.time,
      priority: form.priority,
      followup_type: form.followup_type,
      followup_details: form.followup_details,
      // Web sends the active fiscal year, falling back to 0.
      fiscal_year: 0,
    };

    setLoading(true);
    try {
      await dispatch(createInquiryFollowup({ inquiryId, payload })).unwrap();
      toast.success("Activity added successfully");
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add activity"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Activity Type" required>
        <Dropdown
          placeholder="Select activity type"
          options={FOLLOWUP_TYPE_OPTIONS}
          value={form.followup_type}
          onChange={(v) => setForm((prev) => ({ ...prev, followup_type: v }))}
        />
      </Field>

      <Field label="Priority" required>
        <Dropdown
          placeholder="Select priority"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(v) => setForm((prev) => ({ ...prev, priority: v }))}
        />
      </Field>

      {(["followup_date", "next_followup_date"] as const).map((key) => {
        const isNext = key === "next_followup_date";
        return (
          <Field
            key={key}
            label={isNext ? "Next Followup Date" : "Followup Date"}
            required
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDateOpen(key)}
            >
              <YStack pointerEvents="none">
                <AppInput
                  placeholder={
                    isNext ? "Select next followup date" : "Select followup date"
                  }
                  value={form[key]}
                />
              </YStack>
            </TouchableOpacity>
            <DatePicker
              visible={dateOpen === key}
              selectedDate={form[key] ? new Date(form[key]) : null}
              onClose={() => setDateOpen(null)}
              onDateSelect={(d) => {
                setForm((prev) => ({ ...prev, [key]: toDateValue(d) }));
                setDateOpen(null);
              }}
            />
          </Field>
        );
      })}

      <Field label="Time" required>
        <AppInput
          placeholder="HH:MM"
          value={form.time}
          onChangeText={(v) => setForm((prev) => ({ ...prev, time: v }))}
        />
      </Field>

      <Field label="Details" required>
        <AppInput
          placeholder="Enter followup details"
          value={form.followup_details}
          onChangeText={(v) =>
            setForm((prev) => ({ ...prev, followup_details: v }))
          }
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <SubmitButton label="Add Activity" loading={loading} onPress={submit} />
    </YStack>
  );
}

export function AddDealStatusForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [statuses, setStatuses] = useState<DropdownOption[]>([]);
  const [subStatuses, setSubStatuses] = useState<DropdownOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      customerApi.fetchMasterStatuses(),
      customerApi.fetchMasterSubStatuses(),
    ])
      .then(([statusRes, subStatusRes]) => {
        if (!active) return;
        if (statusRes.success && statusRes.data) {
          setStatuses(statusRes.data.map(toOption));
        }
        if (subStatusRes.success && subStatusRes.data) {
          setSubStatuses(subStatusRes.data.map(toOption));
        }
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async () => {
    if (!status) {
      toast.error("Status is required");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        createInquiryDealStatus({
          inquiryId,
          payload: {
            inquiry: Number(inquiryId),
            status: Number(status),
            sub_status: subStatus ? Number(subStatus) : null,
            remarks: remarks.trim() || null,
          },
        }),
      ).unwrap();
      toast.success("Status added successfully");
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add status"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Status" required>
        <Dropdown
          placeholder="Select status"
          options={statuses}
          value={status}
          onChange={setStatus}
          loading={optionsLoading}
        />
      </Field>

      <Field label="Sub-status">
        <Dropdown
          placeholder="Select sub-status"
          options={subStatuses}
          value={subStatus}
          onChange={setSubStatus}
          loading={optionsLoading}
        />
      </Field>

      <Field label="Remarks">
        <AppInput
          placeholder="Enter remarks"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <SubmitButton label="Add Status" loading={loading} onPress={submit} />
    </YStack>
  );
}

// Two independent saves (one per voice), mirroring web ReviewDrawer: each sends
// only its own field, so a salesperson saving their voice never overwrites the
// HOD's. `customer` only prefills the inputs.
export function ReviewForm({
  inquiryId,
  customer,
}: {
  inquiryId: string;
  customer: Customer;
}) {
  const dispatch = useAppDispatch();
  const [salespersonVoice, setSalespersonVoice] = useState(
    customer.salesperson_voice ?? "",
  );
  const [hodVoice, setHodVoice] = useState(customer.hod_voice ?? "");
  const [saving, setSaving] = useState<"salesperson" | "hod" | null>(null);

  const save = async (field: "salesperson_voice" | "hod_voice") => {
    const value = field === "salesperson_voice" ? salespersonVoice : hodVoice;
    setSaving(field === "salesperson_voice" ? "salesperson" : "hod");
    try {
      await dispatch(
        reviewInquiry({ inquiryId, payload: { [field]: value.trim() } }),
      ).unwrap();
      toast.success("Review saved successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save review"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Salesperson Voice">
        <AppInput
          placeholder="Salesperson's remarks"
          value={salespersonVoice}
          onChangeText={setSalespersonVoice}
          multiline
          numberOfLines={3}
          height={96}
        />
        <SubmitButton
          label="Save"
          loading={saving === "salesperson"}
          onPress={() => save("salesperson_voice")}
        />
      </Field>

      <Field label="HOD / Upper Management Voice">
        <AppInput
          placeholder="Reviewer's remarks"
          value={hodVoice}
          onChangeText={setHodVoice}
          multiline
          numberOfLines={3}
          height={96}
        />
        <SubmitButton
          label="Save"
          loading={saving === "hod"}
          onPress={() => save("hod_voice")}
        />
      </Field>
    </YStack>
  );
}

// Kind + optional note. A downgrade (lower rank than the current kind) needs a
// note, since it goes to admin approval — mirrors web CRM/Inquiry.
export function ChangeKindForm({
  inquiryId,
  customer,
  onDone,
}: {
  inquiryId: string;
  customer: Customer;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [kinds, setKinds] = useState<MasterInquiryKind[]>([]);
  const [selected, setSelected] = useState(
    customer.kind != null ? String(customer.kind) : "",
  );
  const [note, setNote] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    masterApi
      .fetchInquiryKinds()
      .then((res) => {
        if (active && res.success && res.data) setKinds(res.data);
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(() => kinds.map(toOption), [kinds]);

  const currentRank = useMemo(() => {
    const found = kinds.find((k) => String(k.id) === String(customer.kind));
    return found?.rank;
  }, [kinds, customer.kind]);

  const isDowngrade = useMemo(() => {
    if (!selected) return false;
    const newRank = kinds.find((k) => String(k.id) === selected)?.rank;
    return (
      currentRank != null && newRank != null && newRank < currentRank
    );
  }, [selected, kinds, currentRank]);

  const submit = async () => {
    if (!selected) {
      toast.error("Please select a kind");
      return;
    }
    if (selected === String(customer.kind)) {
      onDone();
      return;
    }
    if (isDowngrade && !note.trim()) {
      toast.error("A note is required when downgrading the inquiry kind.");
      return;
    }
    setLoading(true);
    try {
      const result = await dispatch(
        requestInquiryKindChange({
          inquiryId,
          payload: { kind: Number(selected), note: note.trim() || undefined },
        }),
      ).unwrap();
      toast.success(
        result?.data?.kind_change_approval_status === "pending"
          ? "Kind change submitted, pending approval."
          : "Kind updated successfully.",
      );
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to change inquiry kind"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Kind" required>
        <Dropdown
          placeholder="Select kind"
          options={options}
          value={selected}
          onChange={setSelected}
          loading={optionsLoading}
        />
      </Field>

      {isDowngrade ? (
        <Field label="Note" required>
          <Text fontSize="$2" color="$secondaryText">
            This is a downgrade — it needs admin approval. Explain why so the
            admin can review it.
          </Text>
          <AppInput
            placeholder="Reason for downgrading this inquiry's kind"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            height={90}
          />
        </Field>
      ) : null}

      <SubmitButton label="Save" loading={loading} onPress={submit} />
    </YStack>
  );
}

// ─── Convert to Deal ──────────────────────────────────────────────────────────
// Vehicle → Variant → Color cascade backed by the scoped dropdown endpoints
// (not /dms-vehicle/), then year (+ optional discount), mirroring web
// CRM/Inquiry's vehicle drawer.
export function ConvertToDealForm({
  inquiryId,
  vehicleDetail,
  onDone,
}: {
  inquiryId: string;
  /** The inquiry's currently selected vehicle (vehicle_details[0]), if any. */
  vehicleDetail?: VehicleDetail | null;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [vehicles, setVehicles] = useState<MasterOption[]>([]);
  const [variants, setVariants] = useState<MasterOption[]>([]);
  const [colors, setColors] = useState<MasterOption[]>([]);
  // Prefill from the inquiry's selection so the user only adjusts what changed.
  const [vehicle, setVehicle] = useState(() =>
    vehicleDetail?.vehicle != null ? String(vehicleDetail.vehicle) : "",
  );
  const [variant, setVariant] = useState(() =>
    vehicleDetail?.variant != null ? String(vehicleDetail.variant) : "",
  );
  const [color, setColor] = useState(() =>
    vehicleDetail?.color != null ? String(vehicleDetail.color) : "",
  );
  const [year, setYear] = useState(vehicleDetail?.manufacturing_year ?? "");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState("");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    masterApi
      .fetchVehicles()
      .then((res) => {
        if (active && res.success && res.data) {
          setVehicles(res.data.map((v) => ({ id: v.id, name: v.name })));
        }
      })
      .finally(() => {
        if (active) setVehiclesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVariants([]);
    if (!vehicle) return;
    let active = true;
    setVariantsLoading(true);
    masterApi
      .fetchVariantsByVehicle(vehicle)
      .then((res) => {
        if (active && res.success && res.data) setVariants(res.data);
      })
      .finally(() => {
        if (active) setVariantsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [vehicle]);

  useEffect(() => {
    if (!vehicle || !variant) {
      setColors([]);
      return;
    }
    let active = true;
    setColorsLoading(true);
    masterApi
      .fetchColorsByVehicleVariant(vehicle, variant)
      .then((res) => {
        if (active && res.success && res.data) setColors(res.data);
      })
      .finally(() => {
        if (active) setColorsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [vehicle, variant]);

  const vehicleName = vehicles.find((v) => String(v.id) === vehicle)?.name;
  const variantName = variants.find((v) => String(v.id) === variant)?.name;
  const colorName = colors.find((c) => String(c.id) === color)?.name;

  const submit = () => {
    if (!vehicle || !variant || !color || !year.trim()) {
      toast.error("Please select vehicle, variant, color and year");
      return;
    }
    if (hasDiscount && !discount.trim()) {
      toast.error("Discount amount is required");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const yearValue = year.trim().replace(/\//g, "-");
      const formattedYear = /^\d{4}$/.test(yearValue)
        ? `${yearValue}-01-01`
        : yearValue;
      const payload: ConvertToDealPayload = {
        vehicle: Number(vehicle),
        variant: Number(variant),
        color: Number(color),
        year: formattedYear,
      };
      if (hasDiscount && discount.trim()) {
        payload.discount_amount = Number(discount);
      }
      const result = await dispatch(
        convertInquiry({ inquiryId, payload }),
      ).unwrap();
      toast.success(result?.message || "Inquiry successfully converted to deal");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to convert to deal"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <Field label="Vehicle" required>
        <Dropdown
          placeholder="Select vehicle"
          options={vehicles.map(toOption)}
          value={vehicle}
          onChange={(v) => {
            setVehicle(v);
            setVariant("");
            setColor("");
          }}
          loading={vehiclesLoading}
        />
      </Field>

      <Field label="Variant" required>
        <Dropdown
          placeholder={vehicle ? "Select variant" : "Select a vehicle first"}
          options={variants.map(toOption)}
          value={variant}
          onChange={(v) => {
            setVariant(v);
            setColor("");
          }}
          loading={variantsLoading}
          disabled={!vehicle}
        />
      </Field>

      <Field label="Color" required>
        <Dropdown
          placeholder={variant ? "Select color" : "Select a variant first"}
          options={colors.map(toOption)}
          value={color}
          onChange={setColor}
          loading={colorsLoading}
          disabled={!variant}
        />
      </Field>

      <Field label="Model Year" required>
        <AppInput
          placeholder="e.g. 2025 or 2025-01-01"
          value={year}
          onChangeText={setYear}
        />
      </Field>

      <RadioGroup
        label="Discount"
        options={[
          { label: "No", value: "no" },
          { label: "Yes", value: "yes" },
        ]}
        value={hasDiscount ? "yes" : "no"}
        onChange={(v) => setHasDiscount(v === "yes")}
      />

      {hasDiscount ? (
        <Field label="Discount Amount" required>
          <AppInput
            placeholder="Enter discount amount (NPR)"
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
          />
        </Field>
      ) : null}

      <SubmitButton label="Convert to Deal" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Convert to Deal"
        description={`Convert this inquiry to a deal with:\n${selectedSummary(vehicleName, variantName, colorName, year)}`}
        confirmText="Convert"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// ─── Perform Booking ──────────────────────────────────────────────────────────
// Mirrors web CRM/Inquiry's book drawer. Goes up as multipart because of the
// optional document + exchange-vehicle bluebook images.
const COVERED_BY_OPTIONS = [
  { label: "Company", value: "company" },
  { label: "Customer", value: "customer" },
];

// The backend has no "is_bank" flag, so bank-related modes are matched by name
// — same list as web.
const BANK_RELATED_PAYMENT_MODES = new Set([
  "bank transfer",
  "bank finance",
  "letter of credit",
]);

interface ExchangeEntry {
  name: string;
  model_year: string;
  valuation_amount: string;
  registration_number: string;
  bluebook_image: UploadFile | null;
}

const emptyExchangeEntry = (): ExchangeEntry => ({
  name: "",
  model_year: "",
  valuation_amount: "",
  registration_number: "",
  bluebook_image: null,
});

async function pickImage(): Promise<UploadFile | null> {
  try {
    const ImagePicker = await import("expo-image-picker");
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery permission is required.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "upload.jpg",
      type: asset.mimeType ?? "image/jpeg",
    };
  } catch {
    Alert.alert("Error", "Failed to pick an image. Please try again.");
    return null;
  }
}

function FileField({
  label,
  value,
  required,
  onPick,
  onClear,
}: {
  label: string;
  value: UploadFile | null;
  required?: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <Field label={label} required={required}>
      <XStack gap="$2" alignItems="center">
        <Button
          flex={1}
          onPress={onPick}
          backgroundColor="$inputBackground"
          borderWidth={1}
          borderColor="$inputBorderColor"
          height={46}
          borderRadius={12}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text numberOfLines={1} color="$descriptionText" fontSize="$3">
            {value ? value.name : "Choose image"}
          </Text>
        </Button>
        {value ? (
          <TouchableOpacity onPress={onClear} hitSlop={8}>
            <Text color="$error" fontSize="$3" fontWeight="600">
              Remove
            </Text>
          </TouchableOpacity>
        ) : null}
      </XStack>
    </Field>
  );
}

export function BookForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [paymentModes, setPaymentModes] = useState<MasterOption[]>([]);
  const [paymentModesLoading, setPaymentModesLoading] = useState(true);
  const [form, setForm] = useState({
    deal_amount: "",
    booking_amount: "",
    credit_period_days: "",
    payment_mode: "",
    bank: "",
    notes: "",
    insurance_covered_by: "",
    insurance_company_name: "",
    road_tax_covered_by: "",
    route_permit_covered_by: "",
    pan_vat_no: "",
  });
  const [document, setDocument] = useState<UploadFile | null>(null);
  const [exchanges, setExchanges] = useState<ExchangeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let active = true;
    masterApi
      .fetchPaymentModes()
      .then((res) => {
        if (active && res.success && res.data) setPaymentModes(res.data);
      })
      .finally(() => {
        if (active) setPaymentModesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isBankRelated = BANK_RELATED_PAYMENT_MODES.has(
    paymentModes
      .find((m) => String(m.id) === form.payment_mode)
      ?.name.trim()
      .toLowerCase() ?? "",
  );

  const validate = (): string | null => {
    const deal = Number(form.deal_amount);
    const booking = Number(form.booking_amount);
    if (!form.deal_amount.trim() || Number.isNaN(deal) || deal <= 0) {
      return "Deal amount is required and must be positive";
    }
    if (!form.booking_amount.trim() || Number.isNaN(booking) || booking <= 0) {
      return "Booking amount is required and must be positive";
    }
    if (booking > deal) return "Booking amount cannot exceed deal amount";
    if (form.credit_period_days.trim() && !/^\d+$/.test(form.credit_period_days.trim())) {
      return "Credit period must be a whole number of days";
    }
    if (!form.payment_mode) return "Payment mode is required";
    if (!form.insurance_covered_by) return "Select who covers insurance";
    if (form.insurance_covered_by === "company" && !form.insurance_company_name.trim()) {
      return "Insurance company name is required";
    }
    if (!form.road_tax_covered_by) return "Select who covers road tax";
    if (!form.route_permit_covered_by) return "Select who covers route permit";
    if (form.pan_vat_no.trim() && !/^\d{9}$/.test(form.pan_vat_no.trim())) {
      return "PAN/VAT number must be 9 digits";
    }
    for (const entry of exchanges) {
      if (
        !entry.name.trim() ||
        !entry.model_year.trim() ||
        !entry.valuation_amount.trim() ||
        !entry.registration_number.trim()
      ) {
        return "Fill all exchange vehicle fields";
      }
      if (!entry.bluebook_image) {
        return "Upload the bluebook image for each exchange vehicle";
      }
    }
    return null;
  };

  const submit = () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const payload: BookInquiryPayload = {
        deal_amount: Number(form.deal_amount),
        booking_amount: Number(form.booking_amount),
        payment_mode: Number(form.payment_mode),
        insurance_covered_by: form.insurance_covered_by as "company" | "customer",
        road_tax_covered_by: form.road_tax_covered_by as "company" | "customer",
        route_permit_covered_by: form.route_permit_covered_by as
          | "company"
          | "customer",
        ...(form.credit_period_days.trim()
          ? { credit_period_days: Number(form.credit_period_days) }
          : {}),
        ...(isBankRelated && form.bank.trim() ? { bank: form.bank.trim() } : {}),
        ...(document ? { document } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        ...(form.insurance_covered_by === "company"
          ? { insurance_company_name: form.insurance_company_name.trim() }
          : {}),
        ...(form.pan_vat_no.trim() ? { pan_vat_no: form.pan_vat_no.trim() } : {}),
        ...(exchanges.length
          ? {
              exchange_vehicles: exchanges.map((e) => ({
                name: e.name.trim(),
                model_year: Number(e.model_year),
                valuation_amount: Number(e.valuation_amount),
                registration_number: e.registration_number.trim(),
                ...(e.bluebook_image ? { bluebook_image: e.bluebook_image } : {}),
              })),
            }
          : {}),
      };
      const result = await dispatch(
        bookInquiry({ inquiryId, payload }),
      ).unwrap();
      toast.success(result?.message || "Booking submitted, pending approval");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to book inquiry"));
    } finally {
      setLoading(false);
    }
  };

  const paymentModeNameForConfirm =
    paymentModes.find((m) => String(m.id) === form.payment_mode)?.name ?? "—";

  return (
    <YStack gap="$4">
      <Field label="Deal Amount" required>
        <AppInput
          placeholder="Agreed total deal price (NPR)"
          keyboardType="numeric"
          value={form.deal_amount}
          onChangeText={(v) => set("deal_amount", v)}
        />
      </Field>

      <Field label="Booking Amount" required>
        <AppInput
          placeholder="Amount received now (NPR)"
          keyboardType="numeric"
          value={form.booking_amount}
          onChangeText={(v) => set("booking_amount", v)}
        />
      </Field>

      <Field label="Credit Period (in days)">
        <AppInput
          placeholder="e.g. 30"
          keyboardType="numeric"
          value={form.credit_period_days}
          onChangeText={(v) => set("credit_period_days", v)}
        />
      </Field>

      <Field label="Payment Mode" required>
        <Dropdown
          placeholder="Select payment mode"
          options={paymentModes.map(toOption)}
          value={form.payment_mode}
          onChange={(v) => set("payment_mode", v)}
          loading={paymentModesLoading}
        />
      </Field>

      {isBankRelated ? (
        <Field label="Bank">
          <AppInput
            placeholder="Enter bank name"
            value={form.bank}
            onChangeText={(v) => set("bank", v)}
          />
        </Field>
      ) : null}

      <FileField
        label="Document (payment proof)"
        value={document}
        onPick={async () => setDocument(await pickImage())}
        onClear={() => setDocument(null)}
      />

      <Field label="Notes">
        <AppInput
          placeholder="Additional notes (optional)"
          value={form.notes}
          onChangeText={(v) => set("notes", v)}
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <RadioGroup
        label="Insurance Covered By"
        required
        options={COVERED_BY_OPTIONS}
        value={form.insurance_covered_by}
        onChange={(v) => set("insurance_covered_by", v)}
      />

      {form.insurance_covered_by === "company" ? (
        <Field label="Insurance Company Name" required>
          <AppInput
            placeholder="Enter insurance company name"
            value={form.insurance_company_name}
            onChangeText={(v) => set("insurance_company_name", v)}
          />
        </Field>
      ) : null}

      <RadioGroup
        label="Road Tax Covered By"
        required
        options={COVERED_BY_OPTIONS}
        value={form.road_tax_covered_by}
        onChange={(v) => set("road_tax_covered_by", v)}
      />

      <RadioGroup
        label="Route Permit Covered By"
        required
        options={COVERED_BY_OPTIONS}
        value={form.route_permit_covered_by}
        onChange={(v) => set("route_permit_covered_by", v)}
      />

      <Field label="PAN/VAT No.">
        <AppInput
          placeholder="Enter PAN/VAT number"
          keyboardType="numeric"
          value={form.pan_vat_no}
          onChangeText={(v) => set("pan_vat_no", v)}
        />
      </Field>

      <YStack gap="$3">
        <Text fontSize="$3" fontWeight="500" color="$color">
          Exchange Vehicles
        </Text>
        {exchanges.map((entry, index) => (
          <YStack
            key={index}
            gap="$3"
            padding="$3"
            borderWidth={1}
            borderColor="$outline"
            borderRadius={12}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$3" fontWeight="600" color="$color">
                Exchange Vehicle {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setExchanges((prev) => prev.filter((_, i) => i !== index))
                }
                hitSlop={8}
              >
                <Text color="$error" fontSize="$3" fontWeight="600">
                  Remove
                </Text>
              </TouchableOpacity>
            </XStack>

            <Field label="Name" required>
              <AppInput
                placeholder="Enter exchange vehicle name"
                value={entry.name}
                onChangeText={(v) =>
                  setExchanges((prev) =>
                    prev.map((e, i) => (i === index ? { ...e, name: v } : e)),
                  )
                }
              />
            </Field>
            <Field label="Model Year" required>
              <AppInput
                placeholder="e.g. 2019"
                keyboardType="numeric"
                value={entry.model_year}
                onChangeText={(v) =>
                  setExchanges((prev) =>
                    prev.map((e, i) =>
                      i === index ? { ...e, model_year: v } : e,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Valuation Amount" required>
              <AppInput
                placeholder="Enter valuation amount (NPR)"
                keyboardType="numeric"
                value={entry.valuation_amount}
                onChangeText={(v) =>
                  setExchanges((prev) =>
                    prev.map((e, i) =>
                      i === index ? { ...e, valuation_amount: v } : e,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Registration Number" required>
              <AppInput
                placeholder="Enter registration number"
                value={entry.registration_number}
                onChangeText={(v) =>
                  setExchanges((prev) =>
                    prev.map((e, i) =>
                      i === index ? { ...e, registration_number: v } : e,
                    ),
                  )
                }
              />
            </Field>
            <FileField
              label="Bluebook Image (First Page)"
              required
              value={entry.bluebook_image}
              onPick={async () => {
                const file = await pickImage();
                if (!file) return;
                setExchanges((prev) =>
                  prev.map((e, i) =>
                    i === index ? { ...e, bluebook_image: file } : e,
                  ),
                );
              }}
              onClear={() =>
                setExchanges((prev) =>
                  prev.map((e, i) =>
                    i === index ? { ...e, bluebook_image: null } : e,
                  ),
                )
              }
            />
          </YStack>
        ))}
        <Button
          onPress={() => setExchanges((prev) => [...prev, emptyExchangeEntry()])}
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$primary"
          height={46}
          borderRadius={12}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text color="$primary" fontWeight="600">
            Add Exchange Vehicle
          </Text>
        </Button>
      </YStack>

      <SubmitButton label="Perform Booking" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Confirm Booking"
        description={`Deal Amount: ${form.deal_amount}\nBooking Amount: ${form.booking_amount}\nPayment Mode: ${paymentModeNameForConfirm}${
          exchanges.length ? `\nExchange Vehicles: ${exchanges.length}` : ""
        }`}
        confirmText="Confirm Booking"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

function selectedSummary(
  vehicle?: string,
  variant?: string,
  color?: string,
  year?: string,
): string {
  return [
    vehicle ? `Vehicle: ${vehicle}` : null,
    variant ? `Variant: ${variant}` : null,
    color ? `Color: ${color}` : null,
    year ? `Year: ${year}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Edit Customer ────────────────────────────────────────────────────────────
// Mirrors web CRM/Inquiry's CustomerDrawer in edit mode: the same field set as
// the add flow, prefilled from GET /crm/inquiry/{id}/, saved via PATCH. The
// inquiry kind is read-only here — it changes through the Change Kind action.

const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  inquiry_kind: "",
  address: "",
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
  assigned_to: "",
  existing_vehicle_name: "",
  our_vehicle_name: "",
  existing_vehicle_count: "",
  our_vehicle_count: "",
};

const PHONE_CATEGORIES = ["home", "office", "mobile", "other"] as const;

const toPhoneEntries = (phones: PhoneEntry[]): PhoneEntry[] =>
  phones.length
    ? phones
    : [
        {
          id: "phone-1",
          category: "mobile",
          phone: "",
          country_code: "+977",
          relation: 1,
        },
      ];

const toPhoneEntry = (
  p: {
    id: number;
    category: string;
    phone: string;
    country_code: string;
    relation: number;
  },
  index: number,
): PhoneEntry => ({
  id: `phone-${p.id ?? index}`,
  category: (PHONE_CATEGORIES as readonly string[]).includes(
    (p.category ?? "").toLowerCase(),
  )
    ? (p.category.toLowerCase() as PhoneEntry["category"])
    : "mobile",
  phone: p.phone ?? "",
  country_code: p.country_code || "+977",
  relation: p.relation || 1,
});

const toEmailEntries = (
  emails: { id: number; category: string; email: string; relation: number }[],
): EmailEntry[] =>
  emails.length
    ? emails.map((e, i) => ({
        id: `email-${e.id ?? i}`,
        category: ((e.category ?? "").toLowerCase() === "office"
          ? "office"
          : "personal") as EmailEntry["category"],
        email: e.email ?? "",
        relation: e.relation || 1,
      }))
    : [{ id: "email-1", category: "personal", email: "", relation: 1 }];

const toStagedVehicles = (details: VehicleDetail[]): StagedVehicle[] =>
  (details ?? []).map((v) => ({
    dmsId: v.id,
    vehicleName: v.vehicle_name,
    variantName: v.variant_name,
    colorName: v.color_name,
    year: v.manufacturing_year ?? "",
  }));

export function EditCustomerForm({
  inquiryId,
  customer,
  onDone,
}: {
  inquiryId: string;
  customer: Customer;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.crmProfile.profile);
  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return !!(
      profile.is_superuser ||
      profile.authorities?.includes("SUPERUSER") ||
      profile.authorities?.includes("ADMIN") ||
      profile.groups?.some((g) => g.name === "Admin")
    );
  }, [profile]);

  const {
    options: employeeOptions,
    loading: employeesLoading,
    loadingMore: employeesLoadingMore,
    loadMore: onEmployeesEndReached,
  } = useEmployees(isAdmin);

  const {
    inquiryKinds,
    cities,
    sourceTypes,
    vehicles,
    dmsVehicles,
    citiesLoading,
    sourceTypesLoading,
    vehiclesLoading,
    dmsVehiclesLoading,
  } = useAppSelector((state) => ({
    inquiryKinds: state.crmMaster.inquiryKinds,
    cities: state.crmMaster.cities,
    sourceTypes: state.crmMaster.sourceTypes,
    vehicles: state.crmMaster.vehicles,
    dmsVehicles: state.crmMaster.dmsVehicles,
    citiesLoading: state.crmMaster.citiesLoading,
    sourceTypesLoading: state.crmMaster.sourceTypesLoading,
    vehiclesLoading: state.crmMaster.vehiclesLoading,
    dmsVehiclesLoading: state.crmMaster.dmsVehiclesLoading,
  }), shallowEqual);

  const [form, setForm] = useState<CustomerFormData>(EMPTY_CUSTOMER_FORM);
  const [phoneEntries, setPhoneEntries] = useState<PhoneEntry[]>([]);
  const [emailEntries, setEmailEntries] = useState<EmailEntry[]>([]);
  const [vehicleEntries, setVehicleEntries] = useState<StagedVehicle[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMasterInquiryKinds());
    dispatch(fetchMasterCities());
    dispatch(fetchMasterSourceTypes());
    dispatch(fetchMasterVehicles());
    return () => {
      dispatch(resetDmsVehicles());
    };
  }, [dispatch]);

  // The list row is lighter than the detail endpoint, so re-fetch for an
  // accurate prefill; fall back to the row we were handed if that fails.
  useEffect(() => {
    let cancelled = false;
    const apply = (d: Customer) => {
      setForm({
        ...EMPTY_CUSTOMER_FORM,
        name: d.name ?? "",
        inquiry_kind: d.kind != null ? String(d.kind) : "",
        address: d.address ?? "",
        city: d.city != null ? String(d.city) : "",
        source_type: d.inquiry_source != null ? String(d.inquiry_source) : "",
        remarks: d.remarks ?? "",
        assigned_to: d.assigned_to != null ? String(d.assigned_to) : "",
      });
      setPhoneEntries((d.phone ?? []).map(toPhoneEntry));
      setEmailEntries(toEmailEntries(d.email ?? []));
      setVehicleEntries(toStagedVehicles(d.vehicle_details ?? []));
      setLoadingData(false);
    };
    setLoadingData(true);
    dispatch(fetchCustomerById(inquiryId))
      .unwrap()
      .then((detail) => {
        if (!cancelled) apply(detail);
      })
      .catch(() => {
        if (!cancelled) apply(customer);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, inquiryId, customer]);

  const updateField = (key: keyof CustomerFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.inquiry_kind) next.inquiry_kind = "Inquiry kind is required";
    if (!form.source_type) next.source_type = "Source type is required";
    if (!form.city) next.city = "City is required";
    if (!form.address.trim()) next.address = "Address is required";
    phoneEntries.forEach((p) => {
      if (!p.phone.trim())
        next[`phone:${p.id}`] = "Contact number is required";
    });
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please fill in all required fields");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const phones = phoneEntries
        .filter((p) => p.phone.trim())
        .map(
          (p): AddCustomerPhonePayload => ({
            category: p.category,
            phone: p.phone.trim(),
            country_code: p.country_code,
            relation: p.relation,
          }),
        );
      const emails = emailEntries
        .filter((e) => e.email.trim())
        .map(
          (e): AddCustomerEmailPayload => ({
            category: e.category,
            email: e.email.trim(),
            relation: e.relation,
          }),
        );
      const payload: AddCustomerPayload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        city: Number(form.city),
        phone: phones,
        ...(emails.length > 0 && { email: emails }),
        vehicle: vehicleEntries.map((v) => v.dmsId),
        inquiry_source: Number(form.source_type),
        kind: Number(form.inquiry_kind),
        remarks: form.remarks.trim() || undefined,
        ...(isAdmin && form.assigned_to
          ? { assigned_to: Number(form.assigned_to) }
          : {}),
      };
      await dispatch(updateInquiry({ inquiryId, payload })).unwrap();
      toast.success("Customer updated successfully");
      setConfirmOpen(false);
      onDone();
    } catch (err) {
      setConfirmOpen(false);
      toast.error(errorMessage(err, "Failed to update customer"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <YStack paddingVertical="$8" alignItems="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  const toOptions = (items: { id: number; name: string }[]) =>
    items.map((i) => ({ label: i.name, value: String(i.id) }));

  return (
    <YStack gap="$4">
      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="700" color="$color">
          Customer Information
        </Text>

        <Field label="Name" required>
          <AppInput
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Enter name"
            error={errors.name}
          />
        </Field>

        <Dropdown
          label="Inquiry Kind"
          required
          options={toOptions(inquiryKinds)}
          value={form.inquiry_kind}
          onChange={() => {}}
          disabled
          error={errors.inquiry_kind}
        />

        <Dropdown
          label="Source Type"
          required
          placeholder={sourceTypesLoading ? "Loading..." : "Select"}
          options={toOptions(sourceTypes)}
          value={form.source_type}
          onChange={(v) => updateField("source_type", v)}
          disabled={sourceTypesLoading}
          error={errors.source_type}
        />

        <Dropdown
          label="City"
          required
          placeholder={citiesLoading ? "Loading..." : "Select"}
          options={toOptions(cities)}
          value={form.city}
          onChange={(v) => updateField("city", v)}
          disabled={citiesLoading}
          error={errors.city}
        />

        <Field label="Address" required>
          <AppInput
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Enter address"
            error={errors.address}
          />
        </Field>

        {isAdmin && (
          <Dropdown
            label="Assigned To"
            placeholder={employeesLoading ? "Loading..." : "Select employee"}
            options={employeeOptions}
            value={form.assigned_to}
            onChange={(v) => updateField("assigned_to", v)}
            disabled={employeesLoading}
            loading={employeesLoading}
            loadingMore={employeesLoadingMore}
            onEndReached={onEmployeesEndReached}
          />
        )}

        <Field label="Remarks">
          <AppInput
            value={form.remarks}
            onChangeText={(v) => updateField("remarks", v)}
            placeholder="Enter remarks"
            multiline
            numberOfLines={4}
            height={96}
            paddingVertical="$2"
          />
        </Field>
      </YStack>

      <CustomerStepperThree
        phoneEntries={toPhoneEntries(phoneEntries)}
        emailEntries={emailEntries}
        onPhoneEntriesChange={setPhoneEntries}
        onEmailEntriesChange={setEmailEntries}
        errors={errors}
      />

      <VehicleCascade
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        dmsVehicles={dmsVehicles}
        dmsVehiclesLoading={dmsVehiclesLoading}
        onFetchDmsVehicles={(id) => dispatch(fetchDmsVehiclesForVehicle(id))}
        onClearDmsVehicles={() => dispatch(resetDmsVehicles())}
        stagedVehicles={vehicleEntries}
        onStagedChange={setVehicleEntries}
      />

      <SubmitButton label="Save Changes" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Update Customer"
        description="Please verify the details before saving."
        confirmText="Save"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// Phase 6 — record a receipt against a booked inquiry (POST /crm/payment-process/).
// shortcut: the shared DatePicker disables past dates, so a back-dated receipt
// can't be entered from mobile; upgrade if that's needed.
export function AddPaymentForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [paymentTypes, setPaymentTypes] = useState<MasterOption[]>([]);
  const [paymentModes, setPaymentModes] = useState<MasterOption[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [fiscalYearId, setFiscalYearId] = useState<number | null>(null);
  const [form, setForm] = useState({
    payment_type: "",
    payment_mode: "",
    amount: "",
    receipt_date: "",
    next_installment_date: "",
    payment_information: "",
    description: "",
  });
  const [document, setDocument] = useState<UploadFile | null>(null);
  const [dateOpen, setDateOpen] = useState<
    "receipt_date" | "next_installment_date" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let active = true;
    Promise.all([
      masterApi.fetchPaymentTypes(),
      masterApi.fetchPaymentModes(),
      masterApi.fetchFiscalYears(),
    ])
      .then(([types, modes, years]) => {
        if (!active) return;
        if (types.success && types.data) setPaymentTypes(types.data);
        if (modes.success && modes.data) setPaymentModes(modes.data);
        // Matches web: stamp the active fiscal year onto the receipt.
        setFiscalYearId(
          years.data?.find((y) => y.status === true || y.status === 1)?.id ??
            null,
        );
      })
      .finally(() => {
        if (active) setMastersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isCredit =
    paymentTypes
      .find((t) => String(t.id) === form.payment_type)
      ?.name.trim()
      .toLowerCase()
      .includes("credit") ?? false;

  const validate = (): string | null => {
    if (!form.payment_type) return "Payment type is required";
    if (!form.payment_mode) return "Payment mode is required";
    const amount = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      return "Amount is required and must be positive";
    }
    if (!form.receipt_date) return "Receipt date is required";
    if (isCredit && !form.next_installment_date) {
      return "Next installment date is required for credit payments";
    }
    return null;
  };

  const submit = () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const payload: CreatePaymentPayload = {
        inquiry: Number(inquiryId),
        payment_type: Number(form.payment_type),
        payment_mode: Number(form.payment_mode),
        amount: Number(form.amount),
        receipt_date: form.receipt_date,
        fiscal_year: fiscalYearId ?? 0,
        ...(form.payment_information.trim()
          ? { payment_information: form.payment_information.trim() }
          : {}),
        ...(form.description.trim()
          ? { description: form.description.trim() }
          : {}),
        ...(isCredit && form.next_installment_date
          ? { next_installment_date: form.next_installment_date }
          : {}),
        ...(document ? { document } : {}),
      };
      await dispatch(createInquiryPayment({ inquiryId, payload })).unwrap();
      toast.success("Payment added");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add payment"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$3">
      <Field label="Payment Type" required>
        <Dropdown
          placeholder="Select payment type"
          options={paymentTypes.map(toOption)}
          value={form.payment_type}
          onChange={(v) => set("payment_type", v)}
          loading={mastersLoading}
        />
      </Field>

      {isCredit ? (
        <Field label="Next Installment Date" required>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDateOpen("next_installment_date")}
          >
            <YStack pointerEvents="none">
              <AppInput
                placeholder="Select next installment date"
                value={form.next_installment_date}
              />
            </YStack>
          </TouchableOpacity>
          <DatePicker
            visible={dateOpen === "next_installment_date"}
            selectedDate={
              form.next_installment_date
                ? new Date(form.next_installment_date)
                : null
            }
            onClose={() => setDateOpen(null)}
            onDateSelect={(d) => {
              set("next_installment_date", toDateValue(d));
              setDateOpen(null);
            }}
          />
        </Field>
      ) : null}

      <Field label="Amount" required>
        <AppInput
          placeholder="Enter amount received (NPR)"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(v) => set("amount", v)}
        />
      </Field>

      <Field label="Payment Mode" required>
        <Dropdown
          placeholder="Select payment mode"
          options={paymentModes.map(toOption)}
          value={form.payment_mode}
          onChange={(v) => set("payment_mode", v)}
          loading={mastersLoading}
        />
      </Field>

      <Field label="Receipt Date" required>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setDateOpen("receipt_date")}
        >
          <YStack pointerEvents="none">
            <AppInput
              placeholder="Select receipt date"
              value={form.receipt_date}
            />
          </YStack>
        </TouchableOpacity>
        <DatePicker
          visible={dateOpen === "receipt_date"}
          selectedDate={form.receipt_date ? new Date(form.receipt_date) : null}
          onClose={() => setDateOpen(null)}
          onDateSelect={(d) => {
            set("receipt_date", toDateValue(d));
            setDateOpen(null);
          }}
        />
      </Field>

      <Field label="Payment Information">
        <AppInput
          placeholder="Cheque / transaction reference (optional)"
          value={form.payment_information}
          onChangeText={(v) => set("payment_information", v)}
        />
      </Field>

      <Field label="Description">
        <AppInput
          placeholder="Notes (optional)"
          value={form.description}
          onChangeText={(v) => set("description", v)}
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <FileField
        label="Receipt (optional)"
        value={document}
        onPick={async () => setDocument(await pickImage())}
        onClear={() => setDocument(null)}
      />

      <SubmitButton label="Add Payment" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Add Payment"
        description="Please verify the receipt details before saving."
        confirmText="Add"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// Phase 6b — sales document upload (POST /crm/document/, multipart).
// shortcut: expo-document-picker is not installed, so only images can be
// attached from mobile; install it if PDFs/scans must be uploaded here.
export function AddSalesDocumentForm({
  inquiryId,
  onDone,
  defaultIsSalesDocument = true,
}: {
  inquiryId: string;
  onDone: () => void;
  // The Records > Documents tab files plain documents (web hardcodes false).
  defaultIsSalesDocument?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [docTypes, setDocTypes] = useState<MasterDocumentMaster[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [masterDoc, setMasterDoc] = useState("");
  const [isSalesDocument, setIsSalesDocument] = useState(
    defaultIsSalesDocument ? "yes" : "no",
  );
  const [file, setFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    masterApi
      .fetchDocumentMasters()
      .then((res) => {
        if (active && res.success && res.data) setDocTypes(res.data);
      })
      .finally(() => {
        if (active) setMastersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = () => {
    if (!masterDoc) {
      toast.error("Document type is required");
      return;
    }
    if (!file) {
      toast.error("Please attach a document");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await dispatch(
        uploadSalesDocument({
          inquiryId,
          masterDoc: Number(masterDoc),
          file,
          isSalesDocument: isSalesDocument === "yes",
        }),
      ).unwrap();
      toast.success("Document uploaded");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to upload document"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$3">
      <Field label="Document Type" required>
        <Dropdown
          placeholder="Select document type"
          options={docTypes.map(toOption)}
          value={masterDoc}
          onChange={setMasterDoc}
          loading={mastersLoading}
        />
      </Field>

      <Field label="Is Sales Document" required>
        <RadioGroup
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          value={isSalesDocument}
          onChange={setIsSalesDocument}
        />
      </Field>

      <FileField
        label="Document"
        value={file}
        onPick={async () => setFile(await pickImage())}
        onClear={() => setFile(null)}
      />

      <SubmitButton label="Upload Document" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Upload Document"
        description="Please verify the document before uploading."
        confirmText="Upload"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// ─── Test Drive (web CRM/Inquiry/DetailsTabs/TestDriveTabs) ───────────────────

const TEST_DRIVE_STATUS_OPTIONS: DropdownOption[] = [
  { label: "Scheduled", value: "Scheduled" },
  { label: "Completed", value: "Completed" },
  { label: "Canceled", value: "Canceled" },
];

// A test drive is booked against a dealer-stock unit, not a DMS vehicle.
const dealerStockLabel = (item: DealerStockItem): string => {
  const v = item.dms_vehicle;
  const parts = [
    v?.vehicle?.name,
    v?.variant?.name,
    v?.color?.name,
    item.chassis_no,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : `Branch Stock #${item.id}`;
};

export function AddTestDriveForm({
  inquiryId,
  dealerId,
  onDone,
}: {
  inquiryId: string;
  dealerId: number | null;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const { options: employeeOptions, loading: employeesLoading } =
    useEmployees(true);
  const [stocks, setStocks] = useState<DropdownOption[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startMeter, setStartMeter] = useState("");
  const [endMeter, setEndMeter] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [feedback, setFeedback] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (dealerId == null) return;
    let active = true;
    setStocksLoading(true);
    customerApi
      .fetchAvailableDealerStock(dealerId)
      .then((res) => {
        if (!active) return;
        setStocks(
          (res.data ?? []).map((item) => ({
            label: dealerStockLabel(item),
            value: String(item.id),
          })),
        );
      })
      .finally(() => {
        if (active) setStocksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dealerId]);

  // Web keeps kms read-only, derived from the two meter readings.
  const kms =
    startMeter !== "" && endMeter !== ""
      ? String(Number(endMeter) - Number(startMeter))
      : "";

  const submit = () => {
    if (!vehicleId) {
      toast.error("Please select a vehicle");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Start date and time are required");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const payload: CreateTestDrivePayload = {
        inquiry: Number(inquiryId),
        vehicle: Number(vehicleId),
        reported_by: reportedBy ? Number(reportedBy) : null,
        scheduled_date: new Date(
          `${scheduledDate}T${scheduledTime}:00`,
        ).toISOString(),
        end_time: endTime
          ? new Date(`${scheduledDate}T${endTime}:00`).toISOString()
          : null,
        start_meter: startMeter !== "" ? Number(startMeter) : null,
        end_meter: endMeter !== "" ? Number(endMeter) : null,
        kms: kms !== "" ? Number(kms) : null,
        test_drive_status: status,
        feedback: feedback.trim() || null,
      };
      await dispatch(createInquiryTestDrive({ inquiryId, payload })).unwrap();
      toast.success("Test drive scheduled");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to schedule test drive"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$3">
      <Field label="Vehicle" required>
        <Dropdown
          placeholder={stocksLoading ? "Loading stock..." : "Select vehicle"}
          options={stocks}
          value={vehicleId}
          onChange={setVehicleId}
          loading={stocksLoading}
        />
      </Field>

      <Field label="Reported By">
        <Dropdown
          placeholder="Select employee"
          options={employeeOptions}
          value={reportedBy}
          onChange={setReportedBy}
          loading={employeesLoading}
        />
      </Field>

      <Field label="Start Date" required>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setDateOpen(true)}>
          <YStack pointerEvents="none">
            <AppInput placeholder="Select start date" value={scheduledDate} />
          </YStack>
        </TouchableOpacity>
        <DatePicker
          visible={dateOpen}
          selectedDate={scheduledDate ? new Date(scheduledDate) : null}
          onClose={() => setDateOpen(false)}
          onDateSelect={(d) => {
            setScheduledDate(toDateValue(d));
            setDateOpen(false);
          }}
        />
      </Field>

      <Field label="Start Time" required>
        <AppInput
          placeholder="HH:MM"
          value={scheduledTime}
          onChangeText={setScheduledTime}
        />
      </Field>

      <Field label="End Time">
        <AppInput placeholder="HH:MM" value={endTime} onChangeText={setEndTime} />
      </Field>

      <XStack gap="$3">
        <YStack flex={1}>
          <Field label="Start Meter">
            <AppInput
              placeholder="0"
              keyboardType="numeric"
              value={startMeter}
              onChangeText={setStartMeter}
            />
          </Field>
        </YStack>
        <YStack flex={1}>
          <Field label="End Meter">
            <AppInput
              placeholder="0"
              keyboardType="numeric"
              value={endMeter}
              onChangeText={setEndMeter}
            />
          </Field>
        </YStack>
      </XStack>

      <Field label="Kms">
        <YStack pointerEvents="none">
          <AppInput placeholder="Auto" value={kms} />
        </YStack>
      </Field>

      <Field label="Status" required>
        <Dropdown
          placeholder="Select status"
          options={TEST_DRIVE_STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
      </Field>

      <Field label="Feedback">
        <AppInput
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <SubmitButton
        label="Schedule Test Drive"
        loading={loading}
        onPress={submit}
      />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Schedule Test Drive"
        description="Please verify the details before scheduling."
        confirmText="Schedule"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// ─── Quotation (web CRM/Inquiry/DetailsTabs/QuotationTabs) ───────────────────

// Parsed by the backend PDF into the Pro-Forma sample's terms grid; kept in
// sync with the web default.
const DEFAULT_TERMS = `Payment Terms: 30% advance, 70% at delivery
Delivery: Ready stock with in 30 days
Validity: Valid for 30 days
Warranty:
Cancellation Charge: 10% cancellation charge
Insurance & Transport: Insurance by company
Price Inclusions: Inclusive of VAT`;

const dmsVehicleLabel = (v: DmsVehicle): string =>
  [v.vehicle?.name, v.variant?.name, v.color?.name].filter(Boolean).join(" ") ||
  `Vehicle #${v.id}`;

interface QuotationRow {
  key: string;
  vehicle: string;
  price: string;
  qty: string;
  discount: string;
  // The listed customer price at selection time; a change from it needs an
  // approver. Blank when the price is unknown, which counts as unchanged.
  listedPrice: string;
}

const emptyQuotationRow = (): QuotationRow => ({
  key: `${Date.now()}_${Math.random()}`,
  vehicle: "",
  price: "",
  qty: "1",
  discount: "0",
  listedPrice: "",
});

const rowLineTotal = (row: QuotationRow): number =>
  Number(row.price || 0) * Number(row.qty || 1) - Number(row.discount || 0);

export function AddQuotationForm({
  inquiryId,
  onDone,
}: {
  inquiryId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const { options: employeeOptions, loading: employeesLoading } =
    useEmployees(true, true);
  const [vehicles, setVehicles] = useState<DropdownOption[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [rows, setRows] = useState<QuotationRow[]>([emptyQuotationRow()]);
  const [signatory, setSignatory] = useState("");
  const [approver, setApprover] = useState("");
  const [bank, setBank] = useState("no");
  const [bankName, setBankName] = useState("");
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    masterApi
      .fetchDmsVehicles()
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        setVehicles(
          res.data.map((v) => ({
            label: dmsVehicleLabel(v),
            value: String(v.id),
          })),
        );
        setPrices(
          Object.fromEntries(
            res.data
              .filter((v) => v.vehicle_price?.[0]?.customer_price != null)
              .map((v) => [String(v.id), v.vehicle_price![0].customer_price!]),
          ),
        );
      })
      .finally(() => {
        if (active) setVehiclesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setRow = (index: number, patch: Partial<QuotationRow>) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  // Picking a vehicle prefills its listed price and remembers it, so a later
  // manual edit is detected as a price change (needs approval).
  const onVehicleChange = (index: number, value: string) => {
    const listed = prices[value];
    setRow(index, {
      vehicle: value,
      price: listed != null ? String(listed) : "",
      listedPrice: listed != null ? String(listed) : "",
    });
  };

  const priceChanged = rows.some(
    (row) => !!row.listedPrice && Number(row.price || 0) !== Number(row.listedPrice),
  );
  const grandTotal = rows.reduce((sum, row) => sum + rowLineTotal(row), 0);

  const submit = () => {
    if (rows.some((row) => !row.vehicle)) {
      toast.error("Please select a vehicle for every row");
      return;
    }
    if (!signatory) {
      toast.error("Authorized signatory is required");
      return;
    }
    if (priceChanged && !approver) {
      toast.error("Select who should approve this price change");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const payload: CreateQuotationPayload = {
        inquiry: Number(inquiryId),
        signatory: Number(signatory),
        requested_approver:
          priceChanged && approver ? Number(approver) : undefined,
        customer_display_name:
          bank === "yes" ? bankName.trim() || undefined : undefined,
        terms_and_conditions: terms.trim() || undefined,
        remarks: remarks.trim() || undefined,
        quotation_vehicles: rows.map((row) => ({
          vehicle: Number(row.vehicle),
          vehicle_price: row.price !== "" ? Number(row.price) : undefined,
          quantity: row.qty !== "" ? Number(row.qty) : undefined,
          discount: row.discount !== "" ? Number(row.discount) : undefined,
        })),
      };
      await dispatch(createInquiryQuotation({ inquiryId, payload })).unwrap();
      toast.success("Quotation created");
      setConfirmOpen(false);
      onDone();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to create quotation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4">
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <RequiredLabel>Vehicles</RequiredLabel>
          <Button
            onPress={() => setRows((prev) => [...prev, emptyQuotationRow()])}
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="$primary"
            height={38}
            borderRadius={10}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="$primary" fontWeight="600" fontSize="$3">
              + Add Vehicle
            </Text>
          </Button>
        </XStack>

        {rows.map((row, index) => (
          <YStack
            key={row.key}
            gap="$3"
            borderWidth={1}
            borderColor="$outline"
            borderRadius={12}
            padding="$3"
          >
            <Field label="Vehicle" required>
              <Dropdown
                placeholder="Select vehicle"
                options={vehicles}
                value={row.vehicle}
                onChange={(v) => onVehicleChange(index, v)}
                loading={vehiclesLoading}
              />
            </Field>

            <XStack gap="$3">
              <YStack flex={1}>
                <Field label="Price">
                  <AppInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={row.price}
                    onChangeText={(v) => setRow(index, { price: v })}
                  />
                </Field>
              </YStack>
              <YStack flex={1}>
                <Field label="Qty">
                  <AppInput
                    placeholder="1"
                    keyboardType="numeric"
                    value={row.qty}
                    onChangeText={(v) => setRow(index, { qty: v })}
                  />
                </Field>
              </YStack>
              <YStack flex={1}>
                <Field label="Discount">
                  <AppInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={row.discount}
                    onChangeText={(v) => setRow(index, { discount: v })}
                  />
                </Field>
              </YStack>
            </XStack>

            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$3" color="$secondaryText">
                Total: {formatNpr(rowLineTotal(row))}
              </Text>
              {rows.length > 1 ? (
                <TouchableOpacity
                  onPress={() =>
                    setRows((prev) => prev.filter((_, i) => i !== index))
                  }
                  hitSlop={8}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              ) : null}
            </XStack>
          </YStack>
        ))}

        <XStack justifyContent="space-between">
          <Text fontSize="$3" fontWeight="600" color="$color">
            Grand Total
          </Text>
          <Text fontSize="$3" fontWeight="600" color="$color">
            {formatNpr(grandTotal)}
          </Text>
        </XStack>
      </YStack>

      <Field label="Authorized Signatory" required>
        <Dropdown
          placeholder="Select authorized signatory"
          options={employeeOptions}
          value={signatory}
          onChange={setSignatory}
          loading={employeesLoading}
        />
      </Field>

      {priceChanged ? (
        <Field label="Request Approval From" required>
          <Dropdown
            placeholder="Select an employee to request approval from"
            options={employeeOptions}
            value={approver}
            onChange={setApprover}
            loading={employeesLoading}
          />
        </Field>
      ) : null}

      <Field label="Bank Financed?">
        <RadioGroup
          options={[
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ]}
          value={bank}
          onChange={setBank}
        />
      </Field>

      {bank === "yes" ? (
        <Field label="Bank Name">
          <AppInput
            placeholder="Enter bank name"
            value={bankName}
            onChangeText={setBankName}
          />
        </Field>
      ) : null}

      <Field label="Terms & Conditions">
        <AppInput
          placeholder="Enter terms and conditions"
          value={terms}
          onChangeText={setTerms}
          multiline
          numberOfLines={8}
          height={180}
        />
      </Field>

      <Field label="Remarks">
        <AppInput
          placeholder="Enter remarks"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
          height={90}
        />
      </Field>

      <SubmitButton label="Create Quotation" loading={loading} onPress={submit} />

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Create Quotation"
        description="Please verify the quotation before saving."
        confirmText="Create"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}
