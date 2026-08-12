import { Label, type LabelProps } from "@tamagui/label";
import { Text, XStack } from "tamagui";

export function RequiredLabel({
  children,
  ...props
}: LabelProps & { children: string }) {
  return (
    <Label {...props}>
      <XStack gap="$1" alignItems="center">
        <Text fontSize={14} fontWeight="500" color="$color">
          {children}
        </Text>
        <Text color="$error" fontSize="$3">
          *
        </Text>
      </XStack>
    </Label>
  );
}
