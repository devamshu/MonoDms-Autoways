// components/custom/form/FormLabel.tsx
import { Text, XStack } from "tamagui";

interface LabelProps {
  label: string;
  required?: boolean;
}

export function Label({ label, required }: LabelProps) {
  return (
    <XStack gap="$1" alignItems="center">
      <Text fontSize={14} fontWeight="500" color="$color">
        {label}
      </Text>
      {required && (
        <Text fontSize={14} fontWeight="500" color="$red10">
          *
        </Text>
      )}
    </XStack>
  );
}
