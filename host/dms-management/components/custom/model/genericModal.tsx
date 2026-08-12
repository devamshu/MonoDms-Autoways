import React, { useState } from "react";
import {
  Image, // Import from React Native, not Tamagui
  ImageSourcePropType,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, View, XStack } from "tamagui";

export interface GenericModalProps {
  isOpen: boolean;
  title?: string;
  paragraph?: string;
  imageSource?: ImageSourcePropType;
  imageStyle?: object;
  buttonText?: string;
  onButtonPress?: () => void;

  // Confirmation modal props
  variant?: "discard" | "confirmCancel" | "continueOnly";
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  description?: string; // Alias for paragraph
}

export function GenericModal({
  isOpen,
  title,
  paragraph,
  description,
  imageSource,
  imageStyle,
  buttonText,
  onButtonPress,
  variant = "continueOnly",
  cancelText = "Cancel",
  confirmText = "Continue",
  onCancel,
  onConfirm,
  loading = false,
}: GenericModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        setInternalLoading(true);
        await onConfirm();
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleButtonPress = async () => {
    if (onButtonPress) {
      try {
        setInternalLoading(true);
        await onButtonPress();
      } finally {
        setInternalLoading(false);
      }
    }
  };

  // Render different button configurations based on variant
  const renderButtons = () => {
    switch (variant) {
      case "discard":
        return (
          <XStack gap="$3" width="100%">
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              style={{ flex: 1 }}
            ></TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              <View
                height={50}
                borderRadius="$3"
                justifyContent="center"
                alignItems="center"
                backgroundColor="$error"
              >
                <Text fontSize="$3" fontWeight="500" color="$white">
                  {isLoading ? `${confirmText}...` : confirmText}
                </Text>
              </View>
            </TouchableOpacity>
          </XStack>
        );

      case "confirmCancel":
        return (
          <XStack gap="$3" width="100%">
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              <View
                height={50}
                justifyContent="center"
                alignItems="center"
                backgroundColor="transparent"
              >
                <Text fontSize="$3" fontWeight="500" color="$ghost">
                  {cancelText}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              <View
                height={50}
                borderRadius="$3"
                justifyContent="center"
                alignItems="center"
                backgroundColor="$primary"
              >
                <Text fontSize="$3" fontWeight="500" color="$white">
                  {isLoading ? `${confirmText}...` : confirmText}
                </Text>
              </View>
            </TouchableOpacity>
          </XStack>
        );

      case "continueOnly":
      default:
        return (
          <XStack width="100%">
            <TouchableOpacity
              onPress={handleButtonPress || onConfirm || onCancel}
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              <View
                height={50}
                borderRadius="$3"
                justifyContent="center"
                alignItems="center"
                backgroundColor="$primary"
              >
                <Text fontSize="$3" fontWeight="500" color="$white">
                  {isLoading
                    ? `${buttonText || confirmText}...`
                    : buttonText || confirmText}
                </Text>
              </View>
            </TouchableOpacity>
          </XStack>
        );
    }
  };

  const displayParagraph = paragraph || description;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.7)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <View
          backgroundColor="$background"
          borderRadius="$4"
          width="100%"
          maxWidth={400}
          maxHeight="80%"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
        >
          <ScrollView
            contentContainerStyle={{
              padding: 24,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            {imageSource && (
              <View style={{ marginBottom: 10, alignItems: "center" }}>
                <Image
                  source={imageSource}
                  style={[
                    {
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                    },
                    imageStyle,
                  ]}
                  resizeMode="contain"
                />
              </View>
            )}

            {title && (
              <Text
                fontSize="$6"
                fontWeight="600"
                color="$descriptionText"
                marginBottom="$3"
                textAlign="center"
              >
                {title}
              </Text>
            )}

            {displayParagraph && (
              <Text
                fontSize="$4"
                color="$secondaryText"
                marginBottom="$6"
                textAlign="center"
                lineHeight={22}
              >
                {displayParagraph}
              </Text>
            )}

            {renderButtons()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
