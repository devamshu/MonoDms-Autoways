import { AuthScreenWrapper } from "@/components/auth/authScreenWrapper";
import { Button as CustomButton } from "@/components/auth/button";
import { AppInput } from "@/components/auth/input";
import { RequiredLabel } from "@/components/auth/requiredLabel";
import { toast, Toast } from "@/components/auth/toast";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Button, ScrollView, Text, XStack, YStack, useTheme } from "tamagui";
import { clearError } from "../features/auth/store/auth.slice";
import {
  loadRememberedCredentials,
  login,
  saveRememberedCredentials,
} from "../features/auth/store/auth.thunks";
import { useAppDispatch } from "../features/hooks";
import { RootState } from "../features/store";
import { apiClient } from "../services/axios";
import { AppRoutes } from "../utils/navigation";

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const rememberedIdentifier = useSelector(
    (state: RootState) => state.auth.rememberedIdentifier,
  );

  useEffect(() => {
    dispatch(loadRememberedCredentials());
  }, []);

  useEffect(() => {
    if (rememberedIdentifier) {
      setUsername(rememberedIdentifier);
      setRememberMe(true);
    }
  }, [rememberedIdentifier]);

  const dismissToast = () => setShowToast(false);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleLogin = async () => {
    if (!password) {
      showToastMessage("Please enter your password");
      return;
    }

    try {
      const result = await dispatch(
        login({
          username,
          password,
        }),
      );

      if (login.fulfilled.match(result)) {
        await dispatch(saveRememberedCredentials({ username, rememberMe }));
        await apiClient.loadTokens();
        router.replace(AppRoutes.APP_SELECTION);
      } else {
        showToastMessage("Failed to login, Please try again later.");
        dispatch(clearError());
      }
    } catch {
      toast.error("Failed to login, Please try again later.");
    }
  };

  return (
    <AuthScreenWrapper showBack={false}>
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
                Welcome Back!
              </Text>
              <Text
                fontSize="$4"
                fontWeight={400}
                color="$secondaryText"
                textAlign="left"
              >
                Login using your phone or email and password to continue.
              </Text>
            </YStack>

            {/* Form Fields */}
            <YStack gap="$4">
              <YStack gap="$2">
                <RequiredLabel>Phone / Email</RequiredLabel>
                <AppInput
                  placeholder="Enter your email or phone number"
                  value={username}
                  onChangeText={setUsername}
                />
              </YStack>

              <YStack gap="$2">
                <RequiredLabel>Password</RequiredLabel>
                <AppInput
                  flex={1}
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
              </YStack>

              <XStack
                justifyContent="space-between"
                alignItems="center"
                marginTop="$2"
              >
                <XStack alignItems="center" gap="$2">
                  <Button
                    size="$3"
                    padding={0}
                    backgroundColor="transparent"
                    borderWidth={0}
                    onPress={() => setRememberMe(!rememberMe)}
                    icon={
                      <XStack
                        width={20}
                        height={20}
                        borderRadius="$1"
                        borderWidth={2}
                        borderColor="$borderThinColor"
                        backgroundColor={
                          rememberMe ? "$primary" : "transparent"
                        }
                        alignItems="center"
                        justifyContent="center"
                      >
                        {rememberMe && (
                          <Text color="white" fontSize={12}>
                            ✓
                          </Text>
                        )}
                      </XStack>
                    }
                  />
                  <Text
                    fontSize={14}
                    color="$color"
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    Remember Me
                  </Text>
                </XStack>

                <Text
                  fontSize={14}
                  color="$primary"
                  fontWeight="500"
                  onPress={() => router.push(AppRoutes.FORGOT_PASSWORD)}
                >
                  Forgot Password?
                </Text>
              </XStack>

              <CustomButton
                buttonText="Sign In"
                buttonVariant={
                  !username || !password || isLoading ? "disabled" : "primary"
                }
                onPress={handleLogin}
                disabled={!username || !password || isLoading}
                loading={isLoading}
                loadingText="Signing In..."
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
    </AuthScreenWrapper>
  );
}
