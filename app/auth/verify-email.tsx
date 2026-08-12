import { AuthScreenWrapper } from "@/components/auth/authScreenWrapper";
import { Button as CustomButton } from "@/components/auth/button";
import { AppInput } from "@/components/auth/input";
import { Toast } from "@/components/auth/toast";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Text, XStack, YStack } from "tamagui";
import { sendEmailOtp, sendPhoneOtp } from "../features/auth/store/auth.thunks";
import { useAppDispatch } from "../features/hooks";
import { RootState } from "../features/store";
import { formatIdentifier } from "../utils/format";
import { AppRoutes, navigate } from "../utils/navigation";

const RESEND_COOLDOWN = 30;
const OTP_LENGTH = 6;

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(""));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef<any[]>([]);
  const dispatch = useAppDispatch();

  const dismissToast = () => setShowToast(false);
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const params = useLocalSearchParams();
  const { identifier, identifierType } = params;

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const isEmailMode = identifierType === "email";

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown((prev) => prev - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (text: string, index: number) => {
    setCode((prev) => {
      const next = [...prev];
      next[index] = text;

      if (text && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }

      return next;
    });
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (codeArr: string[] = code) => {
    const verificationCode = codeArr.join("");
    if (verificationCode.length !== OTP_LENGTH) {
      showToastMessage(`Please enter the complete ${OTP_LENGTH}-digit code`);
      return;
    }

    navigate.pushWithParams(AppRoutes.RESET_PASSWORD, {
      identifier,
      identifierType,
      verificationToken: verificationCode,
    } as any);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    const result =
      identifierType === "email"
        ? await dispatch(sendEmailOtp(identifier as string))
        : await dispatch(sendPhoneOtp(identifier as string));

    if (
      !(
        sendEmailOtp.fulfilled.match(result) ||
        sendPhoneOtp.fulfilled.match(result)
      )
    ) {
      showToastMessage(
        (result.payload as string) ||
          result.error?.message ||
          "Failed to resend code.",
      );
    } else {
      setCode(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN);
      inputs.current[0]?.focus();
    }
  };

  const formattedIdentifier = formatIdentifier(
    identifier as string,
    identifierType as "email" | "phone",
  );

  return (
    <AuthScreenWrapper showBack={true}>
      <YStack flex={1} backgroundColor="$transparent" paddingTop="$4">
        <YStack paddingHorizontal="$6" paddingTop="$6" gap="$8">
          {/* Header */}
          <YStack gap="$3">
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Verify {isEmailMode ? "Email" : "Phone"}
            </Text>
            <Text fontSize="$4" fontWeight={400} color="$secondaryText">
              Enter the {OTP_LENGTH}-digit OTP sent to your{" "}
              {isEmailMode ? "email" : "phone number"}{" "}
              <Text fontSize="$4" fontWeight={400} color="$color">
                {formattedIdentifier}.
              </Text>
            </Text>
          </YStack>

          {/* OTP + Actions */}
          <YStack gap="$6">
            {/* OTP Boxes */}
            <XStack gap="$2" justifyContent="space-between">
              {code.map((digit, index) => (
                <AppInput
                  key={index}
                  ref={(ref: any) => {
                    inputs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  flex={1}
                  height={58}
                  textAlign="center"
                  fontSize={22}
                  fontWeight="600"
                  borderColor={digit ? "$primary" : "$inputBorderColor"}
                  focusStyle={{ borderColor: "$primary", borderWidth: 1 }}
                />
              ))}
            </XStack>

            {/* Verify Button */}
            <CustomButton
              buttonText="Verify"
              buttonVariant={
                code.some((d) => !d) || isLoading ? "disabled" : "primary"
              }
              onPress={() => handleVerify()}
              disabled={isLoading}
              loading={isLoading}
              loadingText="Verifying..."
            />

            {/* Resend */}
            <XStack gap="$1" justifyContent="center" alignItems="center">
              <Text fontSize={15} color="$secondaryText">
                Haven't received a code?
              </Text>
              <Text
                fontSize={15}
                color="$primary"
                fontWeight="600"
                opacity={resendCooldown > 0 ? 0.5 : 1}
                onPress={handleResendCode}
              >
                {" "}
                {resendCooldown > 0 ? `(${resendCooldown}s)` : "Resend"}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      <Toast show={showToast} message={toastMessage} onDismiss={dismissToast} />
    </AuthScreenWrapper>
  );
}
