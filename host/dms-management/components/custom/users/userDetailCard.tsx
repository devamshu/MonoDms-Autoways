import { ReactNode } from "react";
import { Card, Text, XStack } from "tamagui";

interface InfoRow {
  label?: string;
  value: string | ReactNode;
}

interface UserDetailCardProps {
  title: string;
  rows?: InfoRow[];
  children?: ReactNode;
}

export function UserDetailCard({ title, rows, children }: UserDetailCardProps) {
  return (
    <Card
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
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

      <XStack flexWrap="wrap" gap="$3" rowGap="$2">
        {rows?.map((row, i) => (
          <XStack
            key={i}
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            gap="$2"
          >
            <Text fontSize="$3" color="$secondaryText" minWidth={110}>
              {row.label}
            </Text>
            {typeof row.value === "string" ? (
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
                flexShrink={1}
                textAlign="right"
              >
                {row.value || "—"}
              </Text>
            ) : (
              row.value
            )}
          </XStack>
        ))}

        {children}
      </XStack>
    </Card>
  );
}
