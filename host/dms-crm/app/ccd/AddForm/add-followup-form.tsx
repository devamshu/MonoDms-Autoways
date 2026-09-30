import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, ScrollView, Spinner, Text, YStack } from "tamagui";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../app/features/hooks";
import { toast } from "../../../../../components/auth/toast";
import { ccdApi } from "../../../app/features/ccd/api/ccd.api";
import { FollowupPayload } from "../../../app/features/ccd/types";
import { createFollowup } from "../../../app/features/ccd/store/ccd.thunks";
import { DatePicker } from "../../../components/custom/datePicker";
import { Dropdown } from "../../../components/custom/dropdown";
import { AppInput } from "../../../components/custom/input";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { BitsImages } from "../../../constants/bits";

const discardImage = BitsImages.discard;

const PRIORITY_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const FOLLOWUP_TYPE_OPTIONS = [
  { label: "Call", value: "Call" },
  { label: "Visit", value: "Visit" },
  { label: "Meeting", value: "Meeting" },
  { label: "Email", value: "Email" },
];

const formatDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

interface AddFollowupFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function AddFollowupForm({ onSuccess, onClose }: AddFollowupFormProps) {
  const dispatch = useAppDispatch();
  const { followupSubmitting } = useAppSelector((state) => state.crmCcd);

  const [inquiries, setInquiries] = useState<{ label: string; value: string }[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    inquiry: "",
    followup_date: "",
    next_followup_date: "",
    time: "",
    priority: "",
    followup_type: "",
    followup_details: "",
  });

  const [loading, setLoading] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [followupDateOpen, setFollowupDateOpen] = useState(false);
  const [nextFollowupDateOpen, setNextFollowupDateOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setInquiriesLoading(true);
    ccdApi
      .fetchModuleCustomers(6, { page: 1, page_size: 100 })
      .then((res) => {
        if (!active) return;
        const items = (res?.data?.customers ?? []).map((inq: any) => {
          const displayName =
            inq.name ||
            `${inq.first_name || ""} ${inq.last_name || ""}`.trim() ||
            `Inquiry ${inq.id}`;
          return { label: displayName, value: inq.id.toString() };
        });
        setInquiries(items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setInquiriesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.inquiry || !formData.followup_date || !formData.time || !formData.followup_type || !formData.followup_details) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload: FollowupPayload = {
        inquiry: parseInt(formData.inquiry, 10),
        followup_date: formData.followup_date,
        next_followup_date: formData.next_followup_date || undefined,
        time: formData.time,
        priority: formData.priority || undefined,
        followup_type: formData.followup_type,
        followup_details: formData.followup_details,
      };

      console.log("[AddFollowup] POST /crm/followup/ payload:", JSON.stringify(payload, null, 2));

      await dispatch(createFollowup(payload)).unwrap();
      toast.success("Followup created successfully");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create followup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setDiscardModalOpen(false);
    onClose?.();
  };

  const isFormLoading = inquiriesLoading;
  const isSubmitting = loading || followupSubmitting;

  const canSubmit =
    !!formData.inquiry &&
    !!formData.followup_date &&
    !!formData.time &&
    !!formData.followup_type &&
    !!formData.followup_details;

  if (isFormLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$10" gap="$4">
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
              {/* Inquiry */}
              <YStack gap="$2">
                <RequiredLabel>Select Inquiry</RequiredLabel>
                <Dropdown
                  placeholder="Select an Inquiry"
                  options={inquiries}
                  value={formData.inquiry}
                  onChange={(v) => handleChange("inquiry", v)}
                />
              </YStack>

              {/* Followup Date */}
              <YStack gap="$2">
                <RequiredLabel>Followup Date</RequiredLabel>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setFollowupDateOpen(true)}>
                  <YStack pointerEvents="none">
                    <AppInput placeholder="Select followup date" value={formData.followup_date} />
                  </YStack>
                </TouchableOpacity>
                <DatePicker
                  visible={followupDateOpen}
                  selectedDate={formData.followup_date ? new Date(formData.followup_date) : null}
                  onClose={() => setFollowupDateOpen(false)}
                  onDateSelect={(date) => {
                    handleChange("followup_date", formatDateValue(date));
                    setFollowupDateOpen(false);
                  }}
                />
              </YStack>

              {/* Next Followup Date */}
              <YStack gap="$2">
                <Text fontSize="$3" fontWeight="500" color="$color">
                  Next Followup Date
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setNextFollowupDateOpen(true)}>
                  <YStack pointerEvents="none">
                    <AppInput placeholder="Select next followup date" value={formData.next_followup_date} />
                  </YStack>
                </TouchableOpacity>
                <DatePicker
                  visible={nextFollowupDateOpen}
                  selectedDate={formData.next_followup_date ? new Date(formData.next_followup_date) : null}
                  onClose={() => setNextFollowupDateOpen(false)}
                  onDateSelect={(date) => {
                    handleChange("next_followup_date", formatDateValue(date));
                    setNextFollowupDateOpen(false);
                  }}
                />
              </YStack>

              {/* Time */}
              <YStack gap="$2">
                <RequiredLabel>Time</RequiredLabel>
                <AppInput
                  placeholder="e.g. 14:00:00"
                  value={formData.time}
                  onChangeText={(v) => handleChange("time", v)}
                />
              </YStack>

              {/* Priority */}
              <YStack gap="$2">
                <Text fontSize="$3" fontWeight="500" color="$color">
                  Priority
                </Text>
                <Dropdown
                  placeholder="Select priority"
                  options={PRIORITY_OPTIONS}
                  value={formData.priority}
                  onChange={(v) => handleChange("priority", v)}
                />
              </YStack>

              {/* Followup Type */}
              <YStack gap="$2">
                <RequiredLabel>Followup Type</RequiredLabel>
                <Dropdown
                  placeholder="Select followup type"
                  options={FOLLOWUP_TYPE_OPTIONS}
                  value={formData.followup_type}
                  onChange={(v) => handleChange("followup_type", v)}
                />
              </YStack>

              {/* Followup Details */}
              <YStack gap="$2">
                <RequiredLabel>Followup Details</RequiredLabel>
                <AppInput
                  placeholder="Enter followup details"
                  value={formData.followup_details}
                  onChangeText={(v) => handleChange("followup_details", v)}
                  multiline
                  numberOfLines={3}
                  height={80}
                />
              </YStack>
            </YStack>
          </ScrollView>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !canSubmit}
              backgroundColor="$primary"
              height={48}
              borderRadius={12}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontWeight="600">
                {isSubmitting ? "Saving..." : "Save"}
              </Text>
            </Button>

            {onClose && (
              <Button
                onPress={() => setDiscardModalOpen(true)}
                disabled={isSubmitting}
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
