import { DefaultImages } from "../../../constants/image";
import { Camera, GalleryVerticalEnd } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { Avatar, Text, View, XStack, YStack, useTheme } from "tamagui";
import { ProfileButton } from "../buttons/profileBtn";
import { BottomDrawer } from "../drawer";

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
const DEFAULT_PROFILE_IMAGE = DefaultImages.defaultProfile;

interface ProfileHeaderProps {
  imageUri?: string;
  name?: string;
  email?: string;
  onImageChange?: (uri: string) => void;
  isUploading?: boolean;
}

export function ProfileHeader({
  imageUri,
  name,
  email,
  onImageChange,
  isUploading = false,
}: ProfileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const getFullImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return DEFAULT_PROFILE_IMAGE;

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const baseUrl = IMAGE_BASE_URL?.replace(/\/$/, "");
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    const fullUrl = `${baseUrl}${path}`;

    return fullUrl || DEFAULT_PROFILE_IMAGE;
  };

  const handleTakePhoto = async () => {
    setDrawerOpen(false);
    try {
      const ImagePicker = await import("expo-image-picker");
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera permission is required.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) onImageChange?.(result.assets[0].uri);
    } catch (error) {
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const handleChooseFromGallery = async () => {
    setDrawerOpen(false);
    try {
      const ImagePicker = await import("expo-image-picker");
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Gallery permission is required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) onImageChange?.(result.assets[0].uri);
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery. Please try again.");
    }
  };

  const displayName =
    name && name !== "—" && name !== "Loading..." ? name : "Not provided";

  const displayEmail =
    email && email !== "—" && email !== "Loading..."
      ? email
      : "No email provided";

  const fullImageUrl = getFullImageUrl(imageUri);

  return (
    <>
      <YStack alignItems="center" gap="$3" paddingVertical="$4">
        <TouchableOpacity
          onPress={() => !isUploading && setDrawerOpen(true)}
          activeOpacity={0.8}
          disabled={isUploading}
        >
          <View>
            <Avatar circular size={100}>
              <Avatar.Image
                accessibilityLabel="Profile picture"
                src={fullImageUrl}
              />
              <Avatar.Fallback
                backgroundColor="$color6"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$8" color="$color10">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            </Avatar>

            <XStack
              position="absolute"
              bottom={0}
              right={0}
              width={34}
              height={34}
              borderRadius={17}
              backgroundColor="$primary"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor="$background"
            >
              {/* Contrast here is against the badge's `$primary` fill, which is
                  the same indigo in both themes — not against the page. Using
                  `$background` would turn this near-black in dark mode. */}
              {isUploading ? (
                <ActivityIndicator size="small" color={theme.white?.val} />
              ) : (
                <Camera size={16} color={theme.white?.val} />
              )}
            </XStack>
          </View>
        </TouchableOpacity>

        <YStack alignItems="center" gap="$1">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            {displayName}
          </Text>
          <Text fontSize="$4" color="$color10">
            {displayEmail}
          </Text>
        </YStack>
      </YStack>

      <BottomDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        headerTitle="Photo"
        height={30}
      >
        <ProfileButton
          icon={<Camera size={20} color={theme.color?.val} />}
          onPress={handleTakePhoto}
          text="Take Photo"
          showArrow={false}
        />
        <ProfileButton
          icon={<GalleryVerticalEnd size={20} color={theme.color?.val} />}
          onPress={handleChooseFromGallery}
          text="Choose from gallery"
          showArrow={false}
        />
      </BottomDrawer>
    </>
  );
}
