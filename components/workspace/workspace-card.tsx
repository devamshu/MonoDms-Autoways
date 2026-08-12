import { ReactNode } from "react";
import { Text, View, XStack, YStack } from "tamagui";

type WorkspaceCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  accentColor?: string;
  onPress?: () => void;
};

export function WorkspaceCard({
  title,
  description,
  icon,
  accentColor = "$primary",
  onPress,
}: WorkspaceCardProps) {
  return (
    <View
      borderWidth={1}
      borderColor="$borderThinColor"
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.85, scale: 0.99 } : undefined}
    >
      <XStack gap="$3" alignItems="center">
        {icon ? (
          <View
            width={44}
            height={44}
            borderRadius="$4"
            backgroundColor={accentColor}
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </View>
        ) : null}

        <YStack flex={1} gap="$1">
          <Text fontSize="$5" fontWeight="700" color="$color">
            {title}
          </Text>
          <Text fontSize="$3" color="$secondaryText" lineHeight={20}>
            {description}
          </Text>
        </YStack>
      </XStack>
    </View>
  );
}