import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { Button } from "../../../components/custom/buttons/button";
import { BottomDrawer } from "../../../components/custom/drawer";
import { AppInput } from "../../../components/custom/input";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { BitsImages } from "../../../constants/bits";

interface PartEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartAdd: (partCode: string, name: string, quantity: number) => void;
  isLoading?: boolean;
}

export function PartEntryDrawer({
  open,
  onOpenChange,
  onPartAdd,
  isLoading = false,
}: PartEntryDrawerProps) {
  const [partCode, setPartCode] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const partCodeInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (open) {
      setPartCode("");
      setName("");
      setQuantity("");
      setFocusedField("partCode");
      setTimeout(() => {
        partCodeInputRef.current?.focus();
      }, 100);
    } else {
      setFocusedField(null);
    }
  }, [open]);

  const handleAdd = () => {
    if (partCode.trim() && name.trim() && quantity.trim()) {
      onPartAdd(partCode.trim(), name.trim(), parseInt(quantity));
      setPartCode("");
      setName("");
      setQuantity("");
      onOpenChange(false);
    }
  };

  const handlePartCodeSubmit = () => {
    nameInputRef.current?.focus();
  };

  const handleNameSubmit = () => {
    quantityInputRef.current?.focus();
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const isFormValid =
    partCode.trim() && name.trim() && quantity.trim() && parseInt(quantity) > 0;

  const hasUnsavedData = partCode.trim() || name.trim() || quantity.trim();

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  const handleDiscard = () => {
    setCancelModalOpen(false);
    setPartCode("");
    setName("");
    setQuantity("");
    onOpenChange(false);
  };

  const drawerHeight = 90;

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Add Part"
      height={drawerHeight}
      snapToBottom={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "position" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          scrollEnabled={false}
          contentContainerStyle={{ flexGrow: 1 }}
          nestedScrollEnabled={false}
          scrollEventThrottle={16}
          scrollsToTop={false}
          bounces={false}
        >
          <YStack gap="$4" paddingBottom="$16">
            <YStack gap="$2">
              <RequiredLabel>Part Code</RequiredLabel>
              <AppInput
                ref={partCodeInputRef}
                placeholder="Enter part code"
                value={partCode}
                onChangeText={setPartCode}
                autoCapitalize="characters"
                keyboardType="default"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleFieldFocus("partCode")}
                onBlur={handleFieldBlur}
                onSubmitEditing={handlePartCodeSubmit}
              />
            </YStack>

            <YStack gap="$2">
              <RequiredLabel>Name</RequiredLabel>
              <AppInput
                ref={nameInputRef}
                placeholder="Enter part name"
                value={name}
                onChangeText={setName}
                keyboardType="default"
                returnKeyType="next"
                onFocus={() => handleFieldFocus("name")}
                onBlur={handleFieldBlur}
                onSubmitEditing={handleNameSubmit}
              />
            </YStack>

            <YStack gap="$2">
              <RequiredLabel>Quantity</RequiredLabel>
              <AppInput
                ref={quantityInputRef}
                placeholder="Enter quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="default"
                returnKeyType="done"
                blurOnSubmit={false}
                onFocus={() => handleFieldFocus("quantity")}
                onBlur={handleFieldBlur}
                onSubmitEditing={handleAdd}
              />
            </YStack>
            <XStack gap="$3" paddingBottom="$8">
              <Button
                flex={1}
                buttonVariant="ghost"
                buttonText="Cancel"
                onPress={handleCancel}
              />
              <Button
                flex={1}
                buttonVariant="primary"
                buttonText={isLoading ? "Adding..." : "Add"}
                onPress={handleAdd}
                disabled={!isFormValid || isLoading}
              />
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenericModal
        isOpen={cancelModalOpen}
        variant="discard"
        title="Discard Changes"
        description="You have unsaved changes. If you leave now, your updates will be lost."
        imageSource={BitsImages.discard}
        cancelText="Cancel"
        confirmText="Discard"
        onCancel={() => {
          setCancelModalOpen(false);
          if (Platform.OS === "android") {
            setTimeout(() => {
              if (focusedField === "partCode") {
                partCodeInputRef.current?.focus();
              } else if (focusedField === "name") {
                nameInputRef.current?.focus();
              } else if (focusedField === "quantity") {
                quantityInputRef.current?.focus();
              }
            }, 100);
          }
        }}
        onConfirm={handleDiscard}
      />
    </BottomDrawer>
  );
}
