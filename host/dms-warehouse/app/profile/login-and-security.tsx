import { router } from "expo-router";
import { CheckSquare, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable } from "react-native";
import { ScrollView, Text, useTheme, XStack, YStack } from "tamagui";
import { resetAuth } from "../../../../app/features/auth/store/auth.slice";
import { logout } from "../../../../app/features/auth/store/auth.thunks";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { Button as CustomButton } from "../../components/custom/buttons/button";
import { AppInput } from "../../components/custom/input";
import { RequiredLabel } from "../../components/custom/requiredLabel";
import { toast } from "../../../../components/auth/toast";
import {
    clearProfile,
    clearProfileError,
} from "../features/profile/store/profile.slice";
import { updatePassword } from "../features/profile/store/profile.thunks";
import { AppRoutes } from "../utils/navigation";
export default function LoginAndSecurityScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading: isReduxLoading, error } = useAppSelector(
    (state) => state.warehouseProfile,
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (error) {
    toast.error(error);
    dispatch(clearProfileError());
  }

  const rules = useMemo(
    () => [
      {
        label: "8 to 20 characters",
        valid: newPassword.length >= 8 && newPassword.length <= 20,
      },
      {
        label: "1 uppercase letter and 1 number",
        valid: /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword),
      },
      {
        label: "1 special character (Example: # ? ! $ & @)",
        valid: /[#?!$&@]/.test(newPassword),
      },
    ],
    [newPassword],
  );

  const isNewPasswordValid = rules.every((r) => r.valid);
  const isFormValid =
    !!currentPassword.trim() &&
    isNewPasswordValid &&
    newPassword === confirmPassword;

  const handleLogoutAndRedirect = async () => {
    await dispatch(logout());
    dispatch(resetAuth());
    dispatch(clearProfile());
    router.replace(AppRoutes.LOGIN);
  };

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (!isNewPasswordValid) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await dispatch(
        updatePassword({
          old_password: currentPassword,
          new_password: newPassword,
          re_new_password: confirmPassword,
        }),
      ).unwrap();

      toast.success("Password changed successfully! Please login again.");
      handleLogoutAndRedirect();
    } catch (e: any) {
      console.error("Password update failed:", e);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack
          paddingHorizontal="$5"
          paddingTop="$5"
          paddingBottom="$8"
          gap="$5"
        >
          {/* Current Password */}
          <YStack gap="$2">
            <RequiredLabel>Current Password</RequiredLabel>
            <AppInput
              placeholder="Enter your password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </YStack>

          {/* New Password */}
          <YStack gap="$2">
            <RequiredLabel>New Password</RequiredLabel>
            <AppInput
              placeholder="Enter your password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            {/* Password rules */}
            <YStack marginTop="$2" gap="$1">
              <Text fontSize="$3" color="$color" fontWeight="500">
                Your password must have at least:
              </Text>
              {rules.map((rule, i) => (
                <XStack key={i} gap="$2" alignItems="center" marginTop={6}>
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
              secureTextEntry
              borderColor={
                confirmPassword && confirmPassword !== newPassword
                  ? "$red10"
                  : "$inputBorderColor"
              }
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <Text fontSize={12} color="$red10">
                Passwords do not match
              </Text>
            )}
          </YStack>

          {/* Cancel + Save */}
          <XStack
            justifyContent="flex-end"
            alignItems="center"
            gap="$4"
            marginTop="$2"
          >
            <Pressable onPress={() => router.back()}>
              <Text fontSize={15} fontWeight="600" color="$descriptionText">
                Cancel
              </Text>
            </Pressable>
            <CustomButton
              buttonText="Save"
              buttonVariant={
                !isFormValid || isReduxLoading ? "disabled" : "primary"
              }
              onPress={handleSave}
              disabled={!isFormValid || isReduxLoading}
              loading={isReduxLoading}
              loadingText="Saving..."
              width={120}
            />
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
