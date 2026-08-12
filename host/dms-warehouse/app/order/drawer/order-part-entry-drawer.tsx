import { Button } from "../../../components/custom/buttons/button";
import { BottomDrawer } from "../../../components/custom/drawer";
import { AppInput } from "../../../components/custom/input";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { BitsImages } from "../../../constants/bits";
import { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, TextInput } from "react-native";
import { XStack, YStack } from "tamagui";

interface OrderPartEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartAdd: (partCode: string, quantity: number) => void;
  initialPartCode?: string;
  isPartCodeReadOnly?: boolean;
  isLoading?: boolean;
}

export function OrderPartEntryDrawer({
  open,
  onOpenChange,
  onPartAdd,
  initialPartCode = "",
  isPartCodeReadOnly = false,
  isLoading = false,
}: OrderPartEntryDrawerProps) {
  const [partCode, setPartCode] = useState(initialPartCode);
  const [quantity, setQuantity] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const quantityInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setPartCode(initialPartCode);
      setQuantity("");
    }
  }, [open, initialPartCode]);

  const handleAdd = () => {
    if (partCode.trim() && quantity.trim()) {
      onPartAdd(partCode.trim(), parseInt(quantity));
      setPartCode("");
      setQuantity("");
      onOpenChange(false);
      Keyboard.dismiss();
    }
  };

  const handlePartCodeSubmit = () => {
    quantityInputRef.current?.focus();
  };

  const isFormValid =
    partCode.trim() && quantity.trim() && parseInt(quantity) > 0;

  const hasUnsavedData = partCode.trim() || quantity.trim();

  const handleCancel = () => {
    if (hasUnsavedData) {
      setCancelModalOpen(true);
    } else {
      onOpenChange(false);
      Keyboard.dismiss();
    }
  };

  const handleDiscard = () => {
    setCancelModalOpen(false);
    setPartCode("");
    setQuantity("");
    onOpenChange(false);
    Keyboard.dismiss();
  };

  // Increase drawer height when keyboard is visible
  const drawerHeight = isKeyboardVisible ? 70 : 50;

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Add Part"
      height={drawerHeight}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack gap="$4" paddingBottom={isKeyboardVisible ? "$23" : "$4"}>
          <YStack gap="$2">
            <RequiredLabel>Part ID</RequiredLabel>
            <AppInput
              placeholder="Enter part ID"
              value={partCode}
              onChangeText={setPartCode}
              keyboardType="numeric"
              disabled={isPartCodeReadOnly}
              onSubmitEditing={handlePartCodeSubmit}
            />
          </YStack>

          <YStack gap="$2">
            <RequiredLabel>Quantity</RequiredLabel>
            <AppInput
              ref={quantityInputRef}
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
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

      <GenericModal
        isOpen={cancelModalOpen}
        variant="discard"
        title="Discard Changes"
        description="You have unsaved changes. If you leave now, your updates will be lost."
        imageSource={BitsImages.discard}
        cancelText="Cancel"
        confirmText="Discard"
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleDiscard}
      />
    </BottomDrawer>
  );
}
