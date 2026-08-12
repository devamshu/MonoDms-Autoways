import { AuthScreenWrapper } from "@/components/auth/authScreenWrapper";
import { Button as CustomButton } from "@/components/auth/button";
import { AppInput } from "@/components/auth/input";
import { RequiredLabel } from "@/components/auth/requiredLabel";
import { toast } from "@/components/auth/toast";
import { useLocalSearchParams } from "expo-router";
import { CheckSquare, Eye, EyeOff, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { ScrollView, Text, useTheme, XStack, YStack } from "tamagui";
import { resetPassword } from "../features/auth/store/auth.thunks";
import { useAppDispatch } from "../features/hooks";
import { RootState } from "../features/store";
import { AppRoutes, navigate } from "../utils/navigation";

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();

  const identifier = params.identifier as string;
  const verificationToken = params.verificationToken as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const rules = useMemo(
    () => [
      {
        label: "8 to 20 characters",
        valid: password.length >= 8 && password.length <= 20,
      },
      {
        label: "1 uppercase letter and 1 number",
        valid: /[A-Z]/.test(password) && /[0-9]/.test(password),
      },
      {
        label: "1 special character (Example: # ? ! $ & @)",
        valid: /[#?!$&@]/.test(password),
      },
    ],
    [password],
  );

  const isPasswordValid = rules.every((r) => r.valid);
  const passwordsMatch = !!confirmPassword && confirmPassword === password;
  const isFormValid = isPasswordValid && passwordsMatch;

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!verificationToken || !identifier) {
      toast.error(
        "Missing verification details. Please restart the reset process.",
      );
      return;
    }

    console.log("handleResetPassword - verificationToken:", verificationToken);
    console.log("handleResetPassword - identifier:", identifier);

    const result = await dispatch(
      resetPassword({
        otp: verificationToken,
        new_password: password,
        re_new_password: confirmPassword,
        email: identifier,
      }),
    );

    if (resetPassword.fulfilled.match(result)) {
      toast.success(
        (result.payload as { message?: string })?.message ||
          "Password reset successfully. Please log in.",
      );
      navigate.replace(AppRoutes.LOGIN);
    } else {
      toast.error(
        (result.payload as string) ||
          "Failed to reset password. Please try again.",
      );
    }
  };

  return (
    <AuthScreenWrapper showBack={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <YStack flex={1} backgroundColor="$transparent" paddingTop="$4">
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack
              paddingHorizontal="$6"
              paddingTop="$6"
              paddingBottom="$4"
              gap="$6"
            >
              {/* Header */}
              <YStack gap="$3">
                <Text fontSize="$6" fontWeight="bold" color="$color">
                  Set New Password
                </Text>
                <Text fontSize="$4" fontWeight={400} color="$secondaryText">
                  Enter a new password to keep your account secure.
                </Text>
              </YStack>

              {/* Form */}
              <YStack gap="$4">
                {/* Password */}
                <YStack gap="$2">
                  <RequiredLabel>Password</RequiredLabel>
                  <AppInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={theme.secondaryText?.val} />
                        ) : (
                          <Eye size={20} color={theme.secondaryText?.val} />
                        )}
                      </TouchableOpacity>
                    }
                  />

                  {/* Rules */}
                  <YStack marginTop="$2" gap="$1">
                    <Text fontSize="$3" color="$color" fontWeight="500">
                      Your password must have at least:
                    </Text>
                    {rules.map((rule, i) => (
                      <XStack
                        key={i}
                        gap="$2"
                        alignItems="center"
                        marginTop={6}
                      >
                        {rule.valid ? (
                          <CheckSquare size={16} color={theme.success?.val} />
                        ) : (
                          <X size={16} color={theme.error?.val} />
                        )}
                        <Text
                          fontSize="$3"
                          color={rule.valid ? "$color" : "$secondaryText"}
                        >
                          {rule.label}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </YStack>

                {/* Confirm Password */}
                <YStack gap="$2">
                  <RequiredLabel>Confirm Password</RequiredLabel>
                  <AppInput
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color={theme.secondaryText?.val} />
                        ) : (
                          <Eye size={20} color={theme.secondaryText?.val} />
                        )}
                      </TouchableOpacity>
                    }
                    borderColor={
                      confirmPassword && !passwordsMatch
                        ? "$error"
                        : "$inputBorderColor"
                    }
                  />
                  {confirmPassword && !passwordsMatch && (
                    <Text fontSize="$2" color="$error">
                      Passwords do not match
                    </Text>
                  )}
                </YStack>

                {/* Submit */}
                <CustomButton
                  buttonText="Reset Password"
                  buttonVariant={
                    !isFormValid || isLoading ? "disabled" : "primary"
                  }
                  onPress={handleResetPassword}
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                  loadingText="Resetting..."
                  marginTop="$2"
                />
              </YStack>
            </YStack>
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </AuthScreenWrapper>
  );
}
