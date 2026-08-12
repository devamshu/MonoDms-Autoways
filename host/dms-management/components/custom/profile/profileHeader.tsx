import { Camera, GalleryVerticalEnd } from "lucide-react-native";
import { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Avatar, Text, View, XStack, YStack, useTheme } from "tamagui";
import { ProfileButton } from "../buttons/profileBtn";
import { BottomDrawer } from "../drawer";

interface ProfileHeaderProps {
  imageUri?: string;
  name?: string;
  email?: string;
  onImageChange?: (uri: string) => void;
}

export function ProfileHeader({
  imageUri,
  name,
  email,
  onImageChange,
}: ProfileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

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

  return (
    <>
      <YStack alignItems="center" gap="$3" paddingVertical="$4">
        {/* Avatar with camera badge */}
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.8}
        >
          <View>
            <Avatar circular size={100}>
              {imageUri ? (
                <Avatar.Image
                  accessibilityLabel="Profile picture"
                  src={imageUri}
                />
              ) : (
                <Avatar.Fallback backgroundColor="$backgroundSecondary" />
              )}
            </Avatar>

            {/* Camera icon — bottom-right corner */}
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
                  the same indigo in both themes — not against the page. */}
              <Camera size={16} color={theme.white?.val} />
            </XStack>
          </View>
        </TouchableOpacity>

        {/* User info */}
        <YStack alignItems="center" gap="$1">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            {name}
          </Text>
          <Text fontSize="$4" color="$secondaryText">
            {email}
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
