import { AuthScreenWrapper } from "@/components/auth/authScreenWrapper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "./features/hooks";
import { RootState } from "./features/store";
import { AVAILABLE_APPS, AppSelection, loadSelectedApp, saveSelectedApp } from "./utils/app-selection";
import { AppRoutes } from "./utils/navigation";
import { Button } from "@/host/dms-management/components/custom/buttons/button";

export default function AppSelectionScreen() {
  const [selectedApp, setSelectedApp] = useState<AppSelection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, isCheckingAuth } = useAppSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated) {
      router.replace(AppRoutes.LOGIN);
      return;
    }

    const loadSelection = async () => {
      const savedApp = await loadSelectedApp();
      setSelectedApp(savedApp);
    };

    loadSelection();
  }, [isAuthenticated, isCheckingAuth]);

  const handleSelectApp = async (app: AppSelection) => {
    setSelectedApp(app);
    setIsSaving(true);

    try {
      await saveSelectedApp(app);
      const selectedApp = AVAILABLE_APPS.find((availableApp) => availableApp.id === app);

      if (!selectedApp) {
        throw new Error("Selected app is not available");
      }

      router.replace(selectedApp.route);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthScreenWrapper showBack={false}>
      <YStack flex={1} paddingHorizontal="$6" paddingTop="$8" paddingBottom="$8" gap="$6">
        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="700" color="$color">
            Choose an app
          </Text>
          <Text fontSize="$4" color="$secondaryText">
            Pick the workspace you want to open for this session.
          </Text>
        </YStack>

        <YStack gap="$4">
          {AVAILABLE_APPS.map((app) => {
            const isActive = selectedApp === app.id;

            return (
              <Pressable key={app.id} onPress={() => handleSelectApp(app.id)}>
                <View
                  borderWidth={1}
                  borderColor={isActive ? "$primary" : "$borderThinColor"}
                  backgroundColor={isActive ? "$primaryBackground" : "$background"}
                  borderRadius="$4"
                  padding="$4"
                  shadowColor="#000"
                  shadowOpacity={0.06}
                  shadowRadius={10}
                  shadowOffset={{ width: 0, height: 4 }}
                >
                  <XStack justifyContent="space-between" alignItems="center" gap="$3">
                    <YStack flex={1} gap="$2">
                      <Text fontSize="$5" fontWeight="700" color="$color">
                        {app.title}
                      </Text>
                      <Text fontSize="$3" color="$secondaryText" lineHeight={20}>
                        {app.description}
                      </Text>
                    </YStack>

                    <Button
                      size="$3"
                      backgroundColor={isActive ? "$primary" : "$secondaryBackground"}
                      disabled={isSaving && isActive}
                      onPress={() => handleSelectApp(app.id)}
                      buttonText={isActive ? "Selected" : "Select"}
                      buttonVariant="primary"
                    />
                  </XStack>
                </View>
              </Pressable>
            );
          })}
        </YStack>

        <YStack marginTop="auto" gap="$3">
          <Text fontSize="$3" color="$secondaryText" textAlign="center">
            You can change this later after logging in again.
          </Text>
        </YStack>
      </YStack>
    </AuthScreenWrapper>
  );
}