import { AuthScreenWrapper } from "@/components/auth/authScreenWrapper";
import { Button as CustomButton } from "@/components/auth/button";
import { AppInput } from "@/components/auth/input";
import { GenericModal } from "@/components/auth/genericModal";
import { RequiredLabel } from "@/components/auth/requiredLabel";
import { Toast } from "@/components/auth/toast";
import { BitsImages } from "@/constants/bits";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ScrollView, Text, YStack } from "tamagui";
import { sendEmailOtp } from "../features/auth/store/auth.thunks";
// import { sendPhoneOtp } from "../features/auth/store/auth.thunks";
import { useAppDispatch } from "../features/hooks";
import { RootState } from "../features/store";
import { AppRoutes, navigate } from "../utils/navigation";
import { isEmail } from "../utils/validation";
// import { isPhone } from "../utils/validation";

const accountNotFoundImage = BitsImages.failed;

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const dispatch = useAppDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const dismissToast = () => setShowToast(false);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleContinue = async () => {
    if (!identifier.trim()) {
      showToastMessage("Please enter your email");
      return;
    }

    if (!isEmail(identifier)) {
      showToastMessage("Please enter a valid email");
      return;
    }

    const result = await dispatch(sendEmailOtp(identifier));

    if (sendEmailOtp.fulfilled.match(result)) {
      const message = (result.payload as { message?: string })?.message ?? "";

      // Backend returns success even for unregistered emails with a neutral
      // message. Detect that case and show the "Account Not Found" modal.
      if (message.toLowerCase().includes("if your email is registered")) {
        setShowNotFoundModal(true);
        return;
      }

      navigate.pushWithParams(AppRoutes.VERIFY_EMAIL, {
        identifier,
        identifierType: "email",
        flow: "forgot-password",
      });
    } else {
      showToastMessage(
        (result.payload as string) ||
          "Failed to send verification code. Please try again.",
      );
    }
  };

  return (
    <AuthScreenWrapper>
      <YStack flex={1} backgroundColor="$transparent" paddingTop="$4">
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack
            paddingHorizontal="$6"
            paddingTop="$6"
            paddingBottom="$8"
            gap="$8"
          >
            {/* Header */}
            <YStack gap="$3">
              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$color"
                textAlign="left"
              >
                Forgot Password?
              </Text>
              <Text
                fontSize="$4"
                fontWeight={400}
                color="$secondaryText"
                textAlign="left"
              >
                Enter your email and we will send you a
                verification code to reset your password.
              </Text>
            </YStack>

            <YStack gap="$4" marginTop="$2">
              <YStack gap="$2">
                <RequiredLabel>Email</RequiredLabel>
                <AppInput
                  placeholder="Enter your email"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {identifier && (
                  <Text fontSize={12} color="$secondaryText" marginTop="$1">
                    {isEmail(identifier)
                      ? "✓ Verification code will be sent to this email"
                      : "Enter a valid email"}
                  </Text>
                )}
              </YStack>

              {/* Continue Button */}
              <CustomButton
                buttonText={isLoading ? "Sending Code..." : "Continue"}
                buttonVariant={
                  !identifier || isLoading ? "disabled" : "primary"
                }
                onPress={handleContinue}
                disabled={!identifier || isLoading}
                loading={isLoading}
                loadingText="Sending Code..."
                marginTop="$2"
              />
            </YStack>
          </YStack>
        </ScrollView>

        <Toast
          show={showToast}
          message={toastMessage}
          onDismiss={dismissToast}
        />
      </YStack>

      <GenericModal
        isOpen={showNotFoundModal}
        variant="confirmCancel"
        imageSource={accountNotFoundImage}
        title="Account Not Found"
        description="We couldn't find an account with this email. Please check the email and try again."
        confirmText="Continue"
        onConfirm={() => setShowNotFoundModal(false)}
        onCancel={() => setShowNotFoundModal(false)}
      />
    </AuthScreenWrapper>
  );
}
