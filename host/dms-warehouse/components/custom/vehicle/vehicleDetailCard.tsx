import * as Clipboard from "expo-clipboard";
import { Copy } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Card, Text, useTheme, XStack, YStack } from "tamagui";

interface InfoRow {
  label?: string;
  value: React.ReactNode;
  copyable?: boolean;
}

interface VehicleDetailCardProps {
  title: string;
  rows?: InfoRow[];
  children?: React.ReactNode;
}

export function VehicleDetailCard({
  title,
  rows,
  children,
}: VehicleDetailCardProps) {
  const handleCopy = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
  };
  const theme = useTheme();

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

      <YStack gap="$3">
        {rows?.map((row, i) => (
          <XStack key={i} justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" color="$secondaryText">
              {row.label}
            </Text>

            <XStack alignItems="center" gap="$2">
              {typeof row.value === "string" ? (
                <Text fontSize="$3" fontWeight="600" color="$color">
                  {row.value}
                </Text>
              ) : (
                row.value
              )}

              {row.copyable ? (
                <TouchableOpacity onPress={() => handleCopy(String(row.value))}>
                  <Copy size={16} color={theme.primary?.val} />
                </TouchableOpacity>
              ) : null}
            </XStack>
          </XStack>
        ))}

        {children}
      </YStack>
    </Card>
  );
}
