import { ProfileButton } from "../../components/custom/buttons/profileBtn";
import { GenericModal } from "../../components/custom/model/genericModal";
import { ProfileHeader } from "../../components/custom/profile/profileHeader";
import { toast } from "../../components/custom/toast";
import { router } from "expo-router";
import { Grid2x2, Lock, LogOut, UserCircle } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Text, useTheme, YStack } from "tamagui";
import { ScreenScrollView } from "../../../../components/workspace/screen-scroll-view";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { Images } from "../../constants/image";
import { resetAuth } from "../../../../app/features/auth/store/auth.slice";
import { logout } from "../../../../app/features/auth/store/auth.thunks";
import {
  AppRoutes as RootAppRoutes,
} from "../../../../app/utils/navigation";
import { clearSelectedApp } from "../../../../app/utils/app-selection";
import { clearProfile } from "../features/profile/store/profile.slice";
import {
    fetchProfile,
    updateProfileImage,
} from "../features/profile/store/profile.thunk";
import { AppRoutes } from "../utils/navigation";
import { getImageUrl } from "../../../../app/utils/image";
const logoutImage = Images.logout;

export default function SettingsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector((state) => state.managementProfile);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleRefresh = useCallback(async () => {
    await dispatch(fetchProfile());
  }, [dispatch]);

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
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", { uri: imageUri, name: filename, type } as any);
      await dispatch(updateProfileImage(formData as any)).unwrap();
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetAuth());
    dispatch(clearProfile());
    router.replace(AppRoutes.LOGIN);
  };

  const handleSwitchApp = async () => {
    await clearSelectedApp();
    router.replace(RootAppRoutes.APP_SELECTION);
  };

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
          onPress={() => router.push("../settings/personal-information")}
        />

        <ProfileButton
          icon={<Lock size={22} color={theme?.secondaryText?.val} />}
          text="Login & Security"
          onPress={() => router.push("../settings/login-security")}
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
