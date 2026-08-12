import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import { ScrollView, Separator, Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { Button as CustomButton } from "../../components/custom/buttons/button";
import { AppInput } from "../../components/custom/input";
import { RequiredLabel } from "../../components/custom/requiredLabel";
import { toast } from "../../components/custom/toast";
import {
  fetchProfile,
  updateProfile,
} from "../features/profile/store/profile.thunk";
import { UserProfile } from "../features/profile/types";

type EditingField = "name" | "phone" | "email" | null;

const RESEND_COOLDOWN = 50;

export default function PersonalInformationScreen() {
  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector((state) => state.crmProfile);

  // Field values from profile
  const [nameValue, setNameValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  // Edit state
  const [editingField, setEditingField] = useState<EditingField>(null);

  // Temp edit values
  const [tempPhone, setTempPhone] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempName, setTempName] = useState("");

  // OTP state (for email verify flow)
  const [otpCode, setOtpCode] = useState(["", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const otpInputs = useRef<any[]>([]);
  const isVerifying = useRef(false);

  // Helper function to parse name into first, middle, last
  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    return { firstName, middleName, lastName };
  };

  // Helper function to format name from profile - wrapped in useCallback
  const formatFullName = useCallback(() => {
    if (!profile) return "";
    const nameParts = [
      profile.first_name,
      profile.middle_name,
      profile.last_name,
    ].filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(" ") : profile.username || "";
  }, [profile]);

  // Load profile data
  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      const fullName = formatFullName();
      setNameValue(fullName);
      setTempName(fullName);
      setPhoneValue(profile.phone || "");
      setTempPhone(profile.phone || "");
      setEmailValue(profile.email || "");
      setTempEmail(profile.email || "");
    }
  }, [profile, formatFullName]);

  // Sync local state with Redux profile after updates
  useEffect(() => {
    if (profile) {
      const fullName = formatFullName();
      if (editingField !== "name") {
        setNameValue(fullName);
        setTempName(fullName);
      }
      if (editingField !== "phone") {
        setPhoneValue(profile.phone || "");
        setTempPhone(profile.phone || "");
      }
      if (editingField !== "email") {
        setEmailValue(profile.email || "");
        setTempEmail(profile.email || "");
      }
    }
  }, [profile, editingField, formatFullName]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const startEdit = (field: EditingField) => {
    if (field === "phone") setTempPhone(phoneValue);
    if (field === "email") {
      setTempEmail(emailValue);
      setOtpCode(["", "", "", "", ""]);
      setOtpSent(false);
    }
    if (field === "name") setTempName(nameValue);
    setEditingField(field);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setOtpSent(false);
    setOtpCode(["", "", "", "", ""]);
    isVerifying.current = false;
  };

  // Save name with proper first, middle, last name parsing
  const handleNameSave = async () => {
    if (!tempName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsUpdating(true);
    try {
      const { firstName, middleName, lastName } = parseName(tempName);

      // Only send the name fields, not the entire profile
      await dispatch(
        updateProfile({
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName || null,
        } as Partial<UserProfile>),
      ).unwrap();

      cancelEdit();
      toast.success("Name updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  // Save phone
  const handlePhoneContinue = async () => {
    if (!tempPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsUpdating(true);
    try {
      // Only send the phone field
      await dispatch(
        updateProfile({
          phone: tempPhone,
        } as Partial<UserProfile>),
      ).unwrap();

      cancelEdit();
      toast.success("Phone updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update phone");
    } finally {
      setIsUpdating(false);
    }
  };

  // Send OTP for email
  const handleSendEmailOtp = async () => {
    if (!tempEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    setIsUpdating(true);
    try {
      // TODO: Add send OTP API call
      // await dispatch(sendEmailOtp(tempEmail)).unwrap();
      setOtpSent(true);
      setResendCooldown(RESEND_COOLDOWN);
      setOtpCode(["", "", "", "", ""]);
      setTimeout(() => otpInputs.current[0]?.focus(), 200);
      toast.success(`OTP sent to ${tempEmail}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setIsUpdating(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsUpdating(true);
    try {
      // TODO: Add resend OTP API call
      setOtpCode(["", "", "", "", ""]);
      setResendCooldown(RESEND_COOLDOWN);
      otpInputs.current[0]?.focus();
      toast.success("OTP resent successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to resend OTP");
    } finally {
      setIsUpdating(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (text: string, index: number) => {
    setOtpCode((prev) => {
      const next = [...prev];
      next[index] = text;
      if (text && index < 4) otpInputs.current[index + 1]?.focus();
      if (
        index === 4 &&
        text &&
        next.every((d) => d !== "") &&
        !isVerifying.current
      ) {
        setTimeout(() => handleVerifyEmail(next), 100);
      }
      return next;
    });
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Verify email with OTP
  const handleVerifyEmail = async (codeArr?: string[]) => {
    if (isVerifying.current) return;
    const fullCode = (codeArr || otpCode).join("");
    if (fullCode.length !== 5) {
      toast.error("Please enter the complete 5-digit code");
      return;
    }

    isVerifying.current = true;
    setIsUpdating(true);

    try {
      // TODO: Add verify OTP API call
      // await dispatch(verifyEmailOtp({ email: tempEmail, otp: fullCode })).unwrap();

      // Only send the email field
      await dispatch(
        updateProfile({
          email: tempEmail,
        } as Partial<UserProfile>),
      ).unwrap();

      cancelEdit();
      toast.success("Email verified and updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to verify email");
    } finally {
      isVerifying.current = false;
      setIsUpdating(false);
    }
  };

  const renderField = ({
    label,
    displayValue,
    actionLabel,
    onAction,
    isEditing,
    editContent,
  }: {
    label: string;
    displayValue: string;
    actionLabel: string;
    onAction: () => void;
    isEditing: boolean;
    editContent: React.ReactNode;
  }) => (
    <YStack>
      <YStack paddingHorizontal="$5" paddingVertical="$4" gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} color="$secondaryText">
            {label}
          </Text>
          <Pressable onPress={onAction} disabled={isUpdating}>
            <Text
              fontSize={16}
              fontWeight="500"
              color="$primary"
              textDecorationLine="underline"
            >
              {isEditing ? "Cancel" : actionLabel}
            </Text>
          </Pressable>
        </XStack>

        {!isEditing && (
          <Text fontSize={16} fontWeight="700" color="$descriptionText">
            {displayValue || "—"}
          </Text>
        )}

        {isEditing && editContent}
      </YStack>
      <Separator borderColor="$borderColor" />
    </YStack>
  );

  if (isLoading && !profile) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>Loading profile...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack paddingTop="$2">
          {renderField({
            label: "Full Name",
            displayValue: nameValue || "—",
            actionLabel: "Edit",
            isEditing: editingField === "name",
            onAction: () =>
              editingField === "name" ? cancelEdit() : startEdit("name"),
            editContent: (
              <YStack gap="$3">
                <RequiredLabel>Full Name</RequiredLabel>
                <AppInput
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Enter full name (First Middle Last)"
                />

                <XStack justifyContent="flex-end">
                  <CustomButton
                    buttonText="Save"
                    buttonVariant={
                      !tempName.trim() || isUpdating ? "disabled" : "primary"
                    }
                    onPress={handleNameSave}
                    disabled={!tempName.trim() || isUpdating}
                    loading={isUpdating}
                    loadingText="Saving..."
                    width={120}
                  />
                </XStack>
              </YStack>
            ),
          })}

          {renderField({
            label: "Phone",
            displayValue: phoneValue ? `+977 ${phoneValue}` : "—",
            actionLabel: "Edit",
            isEditing: editingField === "phone",
            onAction: () =>
              editingField === "phone" ? cancelEdit() : startEdit("phone"),
            editContent: (
              <YStack gap="$3">
                <RequiredLabel>Phone</RequiredLabel>
                <AppInput
                  value={tempPhone}
                  onChangeText={setTempPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <XStack justifyContent="flex-end">
                  <CustomButton
                    buttonText="Continue"
                    buttonVariant={
                      !tempPhone.trim() || isUpdating ? "disabled" : "primary"
                    }
                    onPress={handlePhoneContinue}
                    disabled={!tempPhone.trim() || isUpdating}
                    loading={isUpdating}
                    loadingText="Updating..."
                    width={140}
                  />
                </XStack>
              </YStack>
            ),
          })}

          {renderField({
            label: "Email",
            displayValue: emailValue || "—",
            actionLabel: emailValue ? "Verify" : "Add",
            isEditing: editingField === "email",
            onAction: () =>
              editingField === "email" ? cancelEdit() : startEdit("email"),
            editContent: (
              <YStack gap="$3">
                <RequiredLabel>Email</RequiredLabel>
                <AppInput
                  value={tempEmail}
                  onChangeText={(t) => {
                    setTempEmail(t);
                    if (otpSent) {
                      setOtpSent(false);
                      setOtpCode(["", "", "", "", ""]);
                    }
                  }}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {otpSent && (
                  <YStack gap="$3">
                    <Text fontSize={13} color="$secondaryText">
                      A verification code has been sent to{" "}
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color="$descriptionText"
                      >
                        {tempEmail}
                      </Text>
                    </Text>

                    <RequiredLabel>5-digit OTP</RequiredLabel>

                    <XStack gap="$3">
                      {otpCode.map((digit, index) => (
                        <AppInput
                          key={index}
                          ref={(ref) => {
                            otpInputs.current[index] = ref;
                          }}
                          value={digit}
                          onChangeText={(t) => handleOtpChange(t, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          textAlign="center"
                          fontSize={20}
                          fontWeight="600"
                          width={56}
                          height={56}
                        />
                      ))}
                    </XStack>

                    <XStack gap="$1" alignItems="center">
                      <Text fontSize={13} color="$secondaryText">
                        Haven't received a code?
                      </Text>
                      <Pressable
                        onPress={handleResend}
                        disabled={resendCooldown > 0 || isUpdating}
                      >
                        <Text
                          fontSize={13}
                          color="$primary"
                          fontWeight="600"
                          opacity={resendCooldown > 0 ? 0.5 : 1}
                        >
                          {" "}
                          {resendCooldown > 0
                            ? `(${resendCooldown}s)`
                            : "Resend"}
                        </Text>
                      </Pressable>
                    </XStack>
                  </YStack>
                )}

                <XStack justifyContent="flex-end">
                  {!otpSent ? (
                    <CustomButton
                      buttonText="Send OTP"
                      buttonVariant={
                        !tempEmail.trim() || isUpdating ? "disabled" : "primary"
                      }
                      onPress={handleSendEmailOtp}
                      disabled={!tempEmail.trim() || isUpdating}
                      loading={isUpdating}
                      loadingText="Sending..."
                      width={130}
                    />
                  ) : (
                    <CustomButton
                      buttonText="Verify"
                      buttonVariant={
                        otpCode.some((d) => !d) || isUpdating
                          ? "disabled"
                          : "primary"
                      }
                      onPress={() => handleVerifyEmail()}
                      disabled={otpCode.some((d) => !d) || isUpdating}
                      loading={isUpdating}
                      loadingText="Verifying..."
                      width={130}
                    />
                  )}
                </XStack>
              </YStack>
            ),
          })}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
