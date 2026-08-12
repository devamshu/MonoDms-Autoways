import { Card, Text, XStack, YStack } from "tamagui";

interface InfoRow {
  label?: string;
  value: string;
}

interface UserDetailCardProps {
  title: string;
  rows?: InfoRow[];
  children?: React.ReactNode;
}

export function UserDetailCard({ title, rows, children }: UserDetailCardProps) {
  return (
    <Card
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      borderWidth={1}
      borderColor="$inputBorderColor"
      shadowColor="$inputBorderColor"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      elevation={2}
    >
      <Card.Header paddingHorizontal={0} paddingTop={0} marginBottom="$2">
        <Text fontSize="$4" fontWeight="700" color="$color">
          {title}
        </Text>
      </Card.Header>

      <YStack gap="$3">
        {rows?.map((row, i) => (
          <XStack key={i} justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" color="$secondaryText">
              {row.label}
            </Text>
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
              numberOfLines={1}
            >
              {row.value ?? "—"}
            </Text>
          </XStack>
        ))}

        {children}
      </YStack>
    </Card>
  );
}
