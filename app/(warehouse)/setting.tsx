import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { BitsImages } from "@/constants/bits";
import {
  fetchProfile,
  updateProfileImage,
} from "@/host/dms-warehouse/app/features/profile/store/profile.thunks";
import { persistor } from "@/host/dms-warehouse/app/features/store";
import LoginAndSecurityScreen from "@/host/dms-warehouse/app/profile/login-and-security";
import NotificationsScreen from "@/host/dms-warehouse/app/profile/notification";
import PersonalInformationScreen from "@/host/dms-warehouse/app/profile/personal-information";
import {
  formatFullName,
  getFullImageUrl,
} from "@/host/dms-warehouse/app/utils/helper/profileHelper";
import { AppRoutes } from "@/host/dms-warehouse/app/utils/navigation";
import { GenericModal } from "@/host/dms-warehouse/components/custom/model/genericModal";
import { ProfileHeader } from "@/host/dms-warehouse/components/custom/profile/profileHeader";
import SettingsItem from "@/host/dms-warehouse/components/custom/profile/settingsItem";
import { toast } from "@/host/dms-warehouse/components/custom/toast";
import { clearSelectedApp } from "@/app/utils/app-selection";
import { AppRoutes as RootAppRoutes } from "@/app/utils/navigation";
import { router } from "expo-router";
import { Bell, Grid2x2, Lock, LogOut, UserCircle } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, useTheme, YStack } from "tamagui";
import { apiClient } from "../services/axios";

const logoutImage = BitsImages.logout;

export default function SettingsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { open: slideOpen } = useSlideOpen();
  const { profile, isLoading, error } = useAppSelector(
    (state) => state.warehouseProfile,
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fetchAttemptedRef = useRef(false);

  useEffect(() => {
    if (error && !isLoading && fetchAttemptedRef.current) {
      toast.error(error || "Failed to load profile");
    }
  }, [error, isLoading]);

  useEffect(() => {
    if (!profile && !isLoading && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      dispatch(fetchProfile())
        .unwrap()
        .catch(() => { });
    }
  }, [dispatch, profile, isLoading]);

  const fullName = formatFullName(
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name,
    profile?.username,
  );

  const handleImageChange = useCallback(
    async (imageUri: string) => {
      if (!imageUri) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        const filename = imageUri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);

        await dispatch(updateProfileImage(formData)).unwrap();
        toast.success("Profile picture updated successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to update profile picture");
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch],
  );

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await apiClient.clearTokens();
      await persistor.purge();
      router.replace(AppRoutes.LOGIN);
    } catch (error) {
      toast.error("Failed to logout.");
    }
  };

  const handleSwitchApp = async () => {
    await clearSelectedApp();
    router.replace(RootAppRoutes.APP_SELECTION);
  };

  const handlePersonalInformation = useCallback(() => {
    slideOpen(<PersonalInformationScreen />, "Personal Information");
  }, [slideOpen]);

  const handleLoginAndSecurity = useCallback(() => {
    slideOpen(<LoginAndSecurityScreen />, "Login & Security");
  }, [slideOpen]);

  const handleNotifications = useCallback(() => {
    slideOpen(<NotificationsScreen />, "Notifications");
  }, [slideOpen]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView padded={false}>
        <ProfileHeader
          imageUri={getFullImageUrl(profile?.image)}
          name={fullName}
          email={profile?.username || "—"}
          onImageChange={handleImageChange}
          isUploading={isUploading}
        />

        <YStack paddingHorizontal="$5" paddingBottom="$3">
          <Text fontSize={17} fontWeight="700" color="$descriptionText">
            Account
          </Text>
        </YStack>

        <SettingsItem
          icon={<UserCircle size={22} color={theme?.secondaryText?.val} />}
          label="Personal Information"
          onPress={handlePersonalInformation}
        />

        <SettingsItem
          icon={<Lock size={22} color={theme?.secondaryText?.val} />}
          label="Login & Security"
          onPress={handleLoginAndSecurity}
        />

        <SettingsItem
          icon={<Bell size={22} color={theme?.secondaryText?.val} />}
          label="Notifications"
          onPress={handleNotifications}
        />

        <SettingsItem
          icon={<Grid2x2 size={22} color={theme?.secondaryText?.val} />}
          label="Switch App"
          onPress={handleSwitchApp}
        />

        <SettingsItem
          icon={<LogOut size={22} color={theme?.error?.val} />}
          label="Logout"
          onPress={() => setShowLogoutModal(true)}
          isLogout
        />
      </ScreenScrollView>
      <GenericModal
        isOpen={showLogoutModal}
        variant="confirmCancel"
        imageSource={logoutImage}
        title="Logout ?"
        description="Are you sure you want to log out?"
        cancelText="Cancel"
        confirmText="Logout"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </YStack>
  );
}
