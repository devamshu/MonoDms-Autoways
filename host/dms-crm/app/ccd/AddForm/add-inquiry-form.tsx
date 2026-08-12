import { AddInquiryFormProps } from "@/app/features/ccd/types";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../app/features/hooks";
import { ccdApi } from "../../../app/features/ccd/api/ccd.api";
import {
  fetchModuleFields,
  submitCCDResponse,
} from "../../../app/features/ccd/store/ccd.thunks";
import { fetchInquiryDetail } from "../../../app/features/customer/store/customer.thunks";
import { Badge } from "../../../components/custom/badge";
import { DatePicker } from "../../../components/custom/datePicker";
import { Dropdown } from "../../../components/custom/dropdown";
import { AppInput } from "../../../components/custom/input";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { RadioGroup } from "../../../components/custom/radioGroup";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { toast } from "../../../../../components/auth/toast";
import { BitsImages } from "../../../constants/bits";

const discardImage = BitsImages.discard;

const CALL_STATUS_OPTIONS = [
  { label: "Connected", value: "Connected" },
  { label: "Not Connected", value: "Not Connected" },
  { label: "Didnt Answer", value: "Didnt Answer" },
  { label: "Switched Off", value: "Switched Off" },
  { label: "Number Busy", value: "Number Busy" },
  { label: "Invalid Number", value: "Invalid Number" },
  { label: "Not Reachable", value: "Not Reachable" },
  { label: "Do Not Disturb", value: "Do Not Disturb" },
];

const INQUIRY_TYPE_OPTIONS = [
  { label: "Actual Enquiries", value: "Actual Enquiry" },
  { label: "False Enquiries", value: "False Enquiry" },
];

const FALSE_ENQUIRY_TYPE_OPTIONS = [
  { label: "Never Done Enquiry", value: "Never Done Enquiry" },
  { label: "Not The Concerned Person", value: "Not The Concerned Person" },
  { label: "Other", value: "Other" },
];

const formatDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

interface DynamicFieldProps {
  field: any;
  value: string;
  onChange: (fieldId: number, value: string) => void;
}

const DateField = memo(
  ({ field, value, onChange }: DynamicFieldProps) => {
    const [open, setOpen] = useState(false);
    const selectedDate = value ? new Date(value) : null;

    return (
      <YStack gap="$2" paddingBottom="$2">
        <RequiredLabel>{field.label}</RequiredLabel>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen(true)}>
          <YStack pointerEvents="none">
            <AppInput placeholder={`Select ${field.label}`} value={value} />
          </YStack>
        </TouchableOpacity>
        <DatePicker
          visible={open}
          selectedDate={selectedDate}
          onClose={() => setOpen(false)}
          onDateSelect={(date) => {
            onChange(field.id, formatDateValue(date));
            setOpen(false);
          }}
        />
      </YStack>
    );
  },
  (prev, next) =>
    prev.value === next.value &&
    prev.field === next.field &&
    prev.onChange === next.onChange,
);

DateField.displayName = "DateField";

const DynamicField = memo(
  ({ field, value, onChange }: DynamicFieldProps) => {
    const fieldType = field.field_type?.toLowerCase() || "text";

    switch (fieldType) {
      case "radio": {
        const radioChoices = field.options?.choices || [];
        return (
          <YStack gap="$2" paddingBottom="$2">
            <RequiredLabel>{field.label}</RequiredLabel>
            <RadioGroup
              options={radioChoices.map((choice: string) => ({
                label: choice,
                value: choice,
              }))}
              value={value}
              onChange={(v) => onChange(field.id, v)}
            />
          </YStack>
        );
      }

      case "select":
      case "dropdown": {
        const selectChoices = field.options?.choices || [];
        const selectOptions = selectChoices.map((choice: string) => ({
          label: choice,
          value: choice,
        }));
        return (
          <YStack gap="$2" paddingBottom="$2">
            <RequiredLabel>{field.label}</RequiredLabel>
            <Dropdown
              placeholder={`Select ${field.label}`}
              options={selectOptions}
              value={value}
              onChange={(v) => onChange(field.id, v)}
            />
          </YStack>
        );
      }

      case "date":
      case "date_picker":
        return <DateField field={field} value={value} onChange={onChange} />;

      case "textarea":
        return (
          <YStack gap="$2" paddingBottom="$2">
            <RequiredLabel>{field.label}</RequiredLabel>
            <AppInput
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={value}
              onChangeText={(v) => onChange(field.id, v)}
              multiline
              numberOfLines={3}
              height={80}
            />
          </YStack>
        );

      default:
        return (
          <YStack gap="$2" paddingBottom="$2">
            <RequiredLabel>{field.label}</RequiredLabel>
            <AppInput
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={value}
              onChangeText={(v) => onChange(field.id, v)}
            />
          </YStack>
        );
    }
  },
  (prev, next) =>
    prev.value === next.value &&
    prev.field === next.field &&
    prev.onChange === next.onChange,
);

DynamicField.displayName = "DynamicField";

export function AddInquiryForm({
  onSuccess,
  onClose,
  moduleId = 6,
  preSelectedInquiryId,
  salesId,
  jobcardId,
}: AddInquiryFormProps) {
  const dispatch = useAppDispatch();
  const { currentInquiryDetail } = useAppSelector((state) => state.crmCustomer);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const { moduleFields, moduleFieldsLoading, submitting } = useAppSelector(
    (state) => state.crmCcd,
  );

  const [formData, setFormData] = useState({
    inquiry_id: preSelectedInquiryId?.toString() || "",
    call_status: "",
    inquiry_type: "",
    false_enquiry_type: "",
    answers: {} as Record<string, string>,
  });

  const [loading, setLoading] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [showCallStatus, setShowCallStatus] = useState(false);
  const [showInquiryType, setShowInquiryType] = useState(false);
  const [showFalseEnquiry, setShowFalseEnquiry] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    let active = true;
    setInquiriesLoading(true);
    ccdApi
      .fetchModuleCustomers(moduleId, { page: 1, page_size: 100 })
      .then((res) => {
        if (active) setInquiries(res?.data?.customers ?? []);
      })
      .catch((e) => {
        console.error("Failed to load inquiries", e);
      })
      .finally(() => {
        if (active) setInquiriesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      dispatch(fetchModuleFields({ moduleId: String(moduleId) }));
    }
  }, [dispatch, moduleId]);

  // Fetch inquiry detail when preSelectedInquiryId is set
  useEffect(() => {
    if (preSelectedInquiryId) {
      dispatch(fetchInquiryDetail(preSelectedInquiryId.toString()));
    }
  }, [dispatch, preSelectedInquiryId]);

  const existingCCDResponse = useMemo(() => {
    if (!currentInquiryDetail?.ccd_responses?.length) return null;
    const id = formData.inquiry_id;
    if (!id || currentInquiryDetail.id?.toString() !== id) return null;
    return [...currentInquiryDetail.ccd_responses].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [currentInquiryDetail, formData.inquiry_id]);

  useEffect(() => {
    if (!existingCCDResponse || moduleFieldsLoading) return;

    const callStatus = existingCCDResponse.call_status || "";
    const inquiryType = existingCCDResponse.inquiry_type || "";
    const falseInquiryType = existingCCDResponse.false_inquiry_type || "";

    // Rebuild answers map from existing response
    const answersMap: Record<string, string> = {};
    existingCCDResponse.answers?.forEach((answer: any) => {
      answersMap[answer.field] = answer.value;
    });

    setFormData((prev) => ({
      ...prev,
      call_status: callStatus,
      inquiry_type: inquiryType,
      false_enquiry_type: falseInquiryType,
      answers: answersMap,
    }));

    // Restore visibility state
    setShowCallStatus(true);
    if (callStatus === "Connected") {
      setShowInquiryType(true);
      if (inquiryType === "False Enquiry") {
        setShowFalseEnquiry(true);
        setShowQuestions(false);
      } else if (inquiryType === "Actual Enquiry") {
        setShowFalseEnquiry(false);
        setShowQuestions(true);
      }
    } else {
      setShowInquiryType(false);
      setShowFalseEnquiry(false);
      setShowQuestions(false);
    }
  }, [existingCCDResponse, moduleFieldsLoading]);

  const inquiryOptions = useMemo(() => {
    return inquiries.map((inquiry) => {
      const displayName =
        inquiry.name ||
        `${inquiry.first_name || ""} ${inquiry.last_name || ""}`.trim() ||
        `Inquiry ${inquiry.id}`;
      const mobile =
        inquiry.phone?.[0]?.phone || inquiry.contact || "No number";

      return {
        label: `${displayName} - ${mobile}`,
        value: inquiry.id.toString(),
      };
    });
  }, [inquiries]);

  const dynamicFields = useMemo(() => {
    return moduleFields.filter(
      (field) =>
        field.name !== "call_status" &&
        field.name !== "inquiry_type" &&
        field.name !== "false_inquiry_type",
    );
  }, [moduleFields]);

  const handleChange = useCallback(
    (key: string, value: string) => {
      if (key === "inquiry_id") {
        // Selecting an inquiry resets all dependent fields and refetches detail
        if (value) dispatch(fetchInquiryDetail(value));
        setFormData((prev) => ({
          ...prev,
          inquiry_id: value,
          call_status: "",
          inquiry_type: "",
          false_enquiry_type: "",
          answers: {},
        }));
        setShowCallStatus(!!value);
        setShowInquiryType(false);
        setShowFalseEnquiry(false);
        setShowQuestions(false);
        return;
      }

      setFormData((prev) => ({ ...prev, [key]: value }));

      if (key === "call_status") {
        const connected = value === "Connected";
        setShowInquiryType(connected);
        setShowFalseEnquiry(false);
        setShowQuestions(false);
      }

      if (key === "inquiry_type") {
        setShowFalseEnquiry(value === "False Enquiry");
        setShowQuestions(value === "Actual Enquiry");
      }
    },
    [dispatch],
  );

  const handleAnswerChange = useCallback((fieldId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [fieldId]: value },
    }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.call_status) {
      console.error("Please select Call Status");
      return;
    }

    if (!formData.inquiry_id) {
      console.error("Please select an Inquiry");
      return;
    }

    setLoading(true);

    try {
      const isActualEnquiry = formData.inquiry_type === "Actual Enquiry";
      const isFalseEnquiry = formData.inquiry_type === "False Enquiry";

      const answers = isActualEnquiry
        ? dynamicFields
            .map((field) => {
              const value = formData.answers[field.id];
              if (!value) return null;
              return {
                field: field.id,
                value: String(value),
              };
            })
            .filter(
              (answer): answer is { field: number; value: string } =>
                answer !== null,
            )
        : [];

      const payload: any = {
        module: moduleId,
        answers,
        call_status: formData.call_status as "Connected" | "Not Connected",
        inquiry: parseInt(formData.inquiry_id, 10),
      };
      if (salesId) payload.sales = salesId;
      if (jobcardId) payload.jobcard = jobcardId;
      if (isActualEnquiry) {
        payload.is_satisfied = true;
        payload.inquiry_type = "Actual Enquiry";
      }
      if (isFalseEnquiry && formData.false_enquiry_type) {
        payload.inquiry_type = "False Enquiry";
        payload.false_inquiry_type = formData.false_enquiry_type;
      }

      await dispatch(submitCCDResponse(payload)).unwrap();

      toast.success(
        existingCCDResponse
          ? "Response updated successfully"
          : "Response submitted successfully",
      );

      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Failed to submit CCD response:", error);
      toast.error(
        error?.message || "Failed to submit response. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setDiscardModalOpen(false);
    onClose?.();
  };

  const isLoading =
    inquiriesLoading || moduleFieldsLoading || loading || submitting;

  if (isLoading) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$10"
        gap="$4"
      >
        <Spinner size="large" color="$primary" />
        <Text color="$secondaryText">Loading form data...</Text>
      </YStack>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1} height="100%">
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$4" padding="$4">
              {/* Existing CCD Response Banner */}
              {existingCCDResponse && (
                <YStack
                  backgroundColor="$blue2"
                  borderRadius={10}
                  padding="$3"
                  gap="$2"
                  borderWidth={1}
                  borderColor="$blue6"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$3" fontWeight="700" color="$blue10">
                      Previous Response Found
                    </Text>
                    <Badge label="Pre-filled" variant="info" size="sm" />
                  </XStack>
                  <Text fontSize="$2" color="$blue9">
                    This inquiry already has a CCD response. The form has been
                    pre-filled with the latest data. You can update and
                    resubmit.
                  </Text>
                  <XStack gap="$2" flexWrap="wrap" marginTop="$1">
                    {existingCCDResponse.call_status && (
                      <Badge
                        label={existingCCDResponse.call_status}
                        variant="default"
                        size="sm"
                      />
                    )}
                    {existingCCDResponse.inquiry_type && (
                      <Badge
                        label={existingCCDResponse.inquiry_type}
                        variant="info"
                        size="sm"
                      />
                    )}
                  </XStack>
                </YStack>
              )}

              {/* Inquiry Dropdown */}
              <YStack gap="$2">
                <RequiredLabel>Select Inquiry</RequiredLabel>
                <Dropdown
                  placeholder="Select an Inquiry"
                  options={inquiryOptions}
                  value={formData.inquiry_id}
                  onChange={(v) => handleChange("inquiry_id", v)}
                />
              </YStack>

              {/* Call Status Dropdown */}
              {showCallStatus && (
                <YStack gap="$2">
                  <RequiredLabel>Call Status</RequiredLabel>
                  <Dropdown
                    placeholder="Select Call Status"
                    options={CALL_STATUS_OPTIONS}
                    value={formData.call_status}
                    onChange={(v) => handleChange("call_status", v)}
                  />
                </YStack>
              )}

              {/* Inquiry Type Dropdown */}
              {showInquiryType && (
                <YStack gap="$2">
                  <RequiredLabel>Inquiry Type</RequiredLabel>
                  <Dropdown
                    placeholder="Select Inquiry Type"
                    options={INQUIRY_TYPE_OPTIONS}
                    value={formData.inquiry_type}
                    onChange={(v) => handleChange("inquiry_type", v)}
                  />
                </YStack>
              )}

              {/* False Enquiry Type Dropdown */}
              {showFalseEnquiry && (
                <YStack gap="$2">
                  <RequiredLabel>False Enquiry Type</RequiredLabel>
                  <Dropdown
                    placeholder="Select False Enquiry Type"
                    options={FALSE_ENQUIRY_TYPE_OPTIONS}
                    value={formData.false_enquiry_type}
                    onChange={(v) => handleChange("false_enquiry_type", v)}
                  />
                </YStack>
              )}

              {/* Dynamic Questions Section */}
              {showQuestions && (
                <YStack gap="$3" marginTop="$2">
                  {dynamicFields.length > 0 ? (
                    <YStack gap="$2">
                      {dynamicFields.map((field) => (
                        <DynamicField
                          key={field.id}
                          field={field}
                          value={formData.answers[field.id] || ""}
                          onChange={handleAnswerChange}
                        />
                      ))}
                    </YStack>
                  ) : (
                    <YStack
                      padding="$3"
                      backgroundColor="$background"
                      borderRadius="$3"
                    >
                      <Text color="$secondaryText" textAlign="center">
                        No questions configured for this module
                      </Text>
                    </YStack>
                  )}
                </YStack>
              )}
            </YStack>
          </ScrollView>

          {/* Fixed Action Buttons */}
          <YStack
            gap="$3"
            padding="$4"
            paddingTop="$2"
            borderTopWidth={1}
            borderTopColor="$inputBorderColor"
            backgroundColor="$background"
          >
            <Button
              onPress={handleSubmit}
              disabled={
                loading ||
                submitting ||
                !formData.call_status ||
                !formData.inquiry_id
              }
              backgroundColor="$primary"
              height={48}
              borderRadius={12}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontWeight="600">
                {loading || submitting
                  ? "Saving..."
                  : existingCCDResponse
                    ? "Update"
                    : "Save"}
              </Text>
            </Button>

            {onClose && (
              <Button
                onPress={() => setDiscardModalOpen(true)}
                disabled={loading || submitting}
                backgroundColor="$background"
                height={48}
                borderRadius={12}
                borderWidth={1}
                borderColor="$inputBorderColor"
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="$color" fontWeight="600">
                  Cancel
                </Text>
              </Button>
            )}
          </YStack>

          <GenericModal
            isOpen={discardModalOpen}
            variant="discard"
            title="Discard Changes"
            description="You have unsaved changes. If you leave now, your updates will be lost."
            imageSource={discardImage}
            cancelText="Cancel"
            confirmText="Discard"
            onCancel={() => setDiscardModalOpen(false)}
            onConfirm={handleDiscard}
          />
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
