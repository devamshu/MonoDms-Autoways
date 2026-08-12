import { CheckCheck, RefreshCw, X } from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import { Text, XStack } from "tamagui";

interface DiscountActionButtonsProps {
  onDecline: () => void;
  onUpdate: () => void;
  onAccept: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function DiscountActionButtons({
  onDecline,
  onUpdate,
  onAccept,
  loading = false,
  disabled = false,
}: DiscountActionButtonsProps) {
  const isDisabled = loading || disabled;

  return (
    <XStack padding="$4" paddingBottom="$6" gap="$3">
      <XStack
        flex={1}
        height={48}
        borderRadius={14}
        backgroundColor="$error"
        alignItems="center"
        justifyContent="center"
        gap="$2"
        onPress={isDisabled ? undefined : onDecline}
        pressStyle={{ opacity: 0.85 }}
        opacity={isDisabled ? 0.5 : 1}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <X size={16} color="white" />
            <Text color="white" fontWeight="600">
              Decline
            </Text>
          </>
        )}
      </XStack>

      <XStack
        flex={1}
        height={48}
        borderRadius={14}
        backgroundColor="$pending"
        alignItems="center"
        justifyContent="center"
        gap="$2"
        onPress={isDisabled ? undefined : onUpdate}
        pressStyle={{ opacity: 0.85 }}
        opacity={isDisabled ? 0.5 : 1}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <RefreshCw size={16} color="white" />
            <Text color="white" fontWeight="600">
              Update
            </Text>
          </>
        )}
      </XStack>

      <XStack
        flex={1}
        height={48}
        borderRadius={14}
        backgroundColor="$success"
        alignItems="center"
        justifyContent="center"
        gap="$2"
        onPress={isDisabled ? undefined : onAccept}
        pressStyle={{ opacity: 0.85 }}
        opacity={isDisabled ? 0.5 : 1}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <CheckCheck size={16} color="white" />
            <Text color="white" fontWeight="600">
              Accept
            </Text>
          </>
        )}
      </XStack>
    </XStack>
  );
}
