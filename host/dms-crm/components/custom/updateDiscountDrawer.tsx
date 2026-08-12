import { BottomDrawer } from "../../components/custom/drawer";
import { AppInput } from "../../components/custom/input";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface UpdateDiscountDrawerProps {
  open: boolean;
  onClose: () => void;
  currentDiscount: string;
  maxAllowed?: number | null;
  onUpdate: (value: string) => void;
  loading?: boolean;
}

export function UpdateDiscountDrawer({
  open,
  onClose,
  currentDiscount,
  maxAllowed,
  onUpdate,
  loading = false,
}: UpdateDiscountDrawerProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
    }
  }, [open]);

  const validateAmount = (amount: string) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      setError("Please enter a valid number");
      return false;
    }

    if (numAmount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    if (
      maxAllowed !== null &&
      maxAllowed !== undefined &&
      numAmount > maxAllowed
    ) {
      setError(`Amount cannot exceed max allowed: ${maxAllowed}`);
      return false;
    }

    setError("");
    return true;
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    const formatted =
      parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;

    setValue(formatted);
    if (formatted) {
      validateAmount(formatted);
    } else {
      setError("");
    }
  };

  const handleUpdate = () => {
    if (validateAmount(value)) {
      onUpdate(value);
    }
  };

  return (
    <BottomDrawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      headerTitle="Update Discount"
      height={45}
      stickyBottomContent={
        <XStack gap="$3" padding="$4" paddingTop={0}>
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text fontWeight="600">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading || !value || !!error}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#6362E7",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading || !value || !!error ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text color="white" fontWeight="600">
                Update
              </Text>
            )}
          </TouchableOpacity>
        </XStack>
      }
    >
      <YStack gap="$2" padding="$4" paddingTop={0}>
        <Text fontSize="$3" color="$secondaryText">
          Requested Discount
        </Text>
        <AppInput
          value={currentDiscount}
          borderWidth={1}
          borderColor="$inputBorderColor"
          borderRadius="$3"
          height={48}
          paddingHorizontal="$3"
          readOnly={true}
        />

        <Text fontSize="$3" color="$secondaryText" marginTop="$2">
          Update Discount *
        </Text>
        <AppInput
          value={value}
          onChangeText={handleAmountChange}
          placeholder="Enter updated discount"
          borderWidth={1}
          borderColor={error ? "#EF4444" : "$inputBorderColor"}
          borderRadius="$3"
          height={48}
          paddingHorizontal="$3"
          keyboardType="numeric"
        />

        {error && (
          <Text fontSize="$2" color="#EF4444" marginTop="$1">
            {error}
          </Text>
        )}

        {maxAllowed !== null && maxAllowed !== undefined && (
          <Text fontSize="$2" color="$secondaryText" marginTop="$1">
            Max allowed: {maxAllowed}
          </Text>
        )}
      </YStack>
    </BottomDrawer>
  );
}
