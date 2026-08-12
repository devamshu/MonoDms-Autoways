import { Text } from "tamagui";

interface StatusBadgeProps {
  status?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const type = (status || "").toUpperCase();

  const themeMap: Record<string, { bg: string; color: string }> = {
    STOCK: {
      bg: "$successBackground",
      color: "$success",
    },
    DISPATCHED: {
      bg: "$ongoingBackground",
      color: "$ongoing",
    },
    SOLD: {
      bg: "$pendingBackground",
      color: "$pending",
    },
    DAMAGED: {
      bg: "$errorBackground",
      color: "$error",
    },
    DEFAULT: {
      bg: "$backgroundSecondary",
      color: "$secondaryText",
    },
  };

  const theme = themeMap[type] || themeMap.DEFAULT;

  return (
    <Text
      fontSize={10}
      fontWeight="600"
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      backgroundColor={theme.bg}
      color={theme.color}
      overflow="hidden"
    >
      {type || "UNKNOWN"}
    </Text>
  );
}
