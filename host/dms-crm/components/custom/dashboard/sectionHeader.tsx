import { Text, XStack } from "tamagui";

export function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll: () => void;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingTop="$2">
      <Text fontSize="$5" fontWeight="700" color="$color">
        {title}
      </Text>
      <Text fontSize="$3" color="$primary" onPress={onViewAll}>
        View all
      </Text>
    </XStack>
  );
}
