import { resetAuth } from "@/app/features/auth/store/auth.slice";
import { logout } from "@/app/features/auth/store/auth.thunks";
import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { BitsImages } from "@/constants/bits";
import { clearProfile } from "@/host/dms-crm/app/features/profile/store/profile.slice";
import {
  fetchProfile,
  updateProfileImage,
} from "@/host/dms-crm/app/features/profile/store/profile.thunk";
import LoginAndSecurityScreen from "@/host/dms-crm/app/profile/login-and-security";
import NotificationsScreen from "@/host/dms-crm/app/profile/notification";
import PersonalInformationScreen from "@/host/dms-crm/app/profile/personal-information";
import { AppRoutes } from "@/host/dms-crm/app/utils/navigation";
import { ProfileButton } from "@/host/dms-crm/components/custom/buttons/profileBtn";

import { clearSelectedApp } from "@/app/utils/app-selection";
import { AppRoutes as RootAppRoutes } from "@/app/utils/navigation";
import { GenericModal } from "@/host/dms-crm/components/custom/model/genericModal";
import { ProfileHeader } from "@/host/dms-crm/components/custom/profile/profileHeader";
import { toast } from "@/host/dms-crm/components/custom/toast";
import { Images } from "@/host/dms-crm/constants/image";
import { router } from "expo-router";
import { Bell, Grid2x2, Lock, LogOut, UserCircle } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Text, useTheme, YStack } from "tamagui";
import { getImageUrl } from "../utils/image";

const logoutImage = BitsImages.logout || Images.defaultProfile;

export default function SettingsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { open: slideOpen } = useSlideOpen();
  const { profile, isLoading } = useAppSelector((state) => state.crmProfile);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  const fullName =
    [profile?.first_name, profile?.middle_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    profile?.username ||
    "—";

  const handleImageChange = async (imageUri: string) => {
    if (!imageUri) return;
    setIsUploading(true);
    try {
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const serial = { uri: imageUri, name: filename, type };
      await dispatch(updateProfileImage(serial)).unwrap();
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    router.replace(AppRoutes.LOGIN);
    await dispatch(logout());
    dispatch(resetAuth());
    dispatch(clearProfile());
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

  const handleRefresh = useCallback(async () => {
    await dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView padded={false} onRefresh={handleRefresh}>
        <ProfileHeader
          imageUri={getImageUrl(profile?.image)}
          name={isLoading && !profile ? "Loading..." : fullName}
          email={profile?.username || (isLoading ? "Loading..." : "—")}
          onImageChange={handleImageChange}
        />

        <YStack paddingHorizontal="$5" paddingBottom="$3">
          <Text fontSize={17} fontWeight="700" color="$descriptionText">
            Account
          </Text>
        </YStack>

        <ProfileButton
          icon={<UserCircle size={22} color={theme?.secondaryText?.val} />}
          text="Personal Information"
          onPress={handlePersonalInformation}
        />

        <ProfileButton
          icon={<Lock size={22} color={theme?.secondaryText?.val} />}
          text="Login & Security"
          onPress={handleLoginAndSecurity}
        />

        <ProfileButton
          icon={<Bell size={22} color={theme?.secondaryText?.val} />}
          text="Notifications"
          onPress={handleNotifications}
        />

        <ProfileButton
          icon={<Grid2x2 size={22} color={theme?.secondaryText?.val} />}
          text="Switch App"
          onPress={handleSwitchApp}
        />

        <ProfileButton
          icon={<LogOut size={22} color={theme?.error?.val} />}
          text="Logout"
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
