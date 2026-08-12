import { ArrowDown, ArrowUp } from "lucide-react-native";
import { Card, Text, useTheme, XStack } from "tamagui";

export type TrendType = "increase" | "decrease";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: {
    type: TrendType;
    percentage: number;
    comparisonText?: string;
  };
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  iconBg = "$statIconBackgroundIndigo",
  trend,
  prefix = "",
  suffix = "",
  formatter,
}: StatsCardProps) => {
  const formattedValue = formatter
    ? formatter(typeof value === "number" ? value : 0)
    : typeof value === "number"
      ? `${prefix}${value.toLocaleString()}${suffix}`
      : value;

  return (
    <Card
      backgroundColor="$background"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$inputBorderColor"
      paddingHorizontal="$5"
      paddingVertical="$5"
      marginBottom="$4"
      gap="$3"
      shadowColor="$inputBorderColor"
      shadowOffset={{ width: 0, height: 12 }}
      shadowOpacity={0.14}
      shadowRadius={18}
      elevation={8}
    >
      <XStack alignItems="center" gap="$4">
        {icon && (
          <XStack
            backgroundColor={iconBg}
            width={52}
            height={52}
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </XStack>
        )}

        <Text
          fontSize={22}
          fontWeight="600"
          color="$color"
          letterSpacing={-0.5}
        >
          {formattedValue}
        </Text>
      </XStack>

      <Text fontSize="$4" fontWeight="500" color="$secondaryText">
        {title}
      </Text>

      {/* Trend */}
      {trend && (
        <XStack gap="$2" alignItems="center" justifyContent="flex-start">
          <TrendBadge type={trend.type} percentage={trend.percentage} />
          {trend.comparisonText && (
            <Text fontSize="$3" color="$secondaryText" fontWeight="400">
              {trend.comparisonText}
            </Text>
          )}
        </XStack>
      )}
    </Card>
  );
};

const TrendBadge = ({
  type,
  percentage,
}: {
  type: TrendType;
  percentage: number;
}) => {
  const theme = useTheme();
  const isIncrease = type === "increase";
  const fg = isIncrease ? "$success" : "$error";
  const bg = isIncrease ? "$successBackground" : "$errorBackground";
  const fgVal = isIncrease ? theme.success?.val : theme.error?.val;

  return (
    <XStack
      alignItems="center"
      gap="$1"
      backgroundColor={bg}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$10"
    >
      <Text fontSize="$2" fontWeight="600" color={fg}>
        {Math.abs(percentage)}%
      </Text>
      {isIncrease ? (
        <ArrowUp size={11} color={fgVal} />
      ) : (
        <ArrowDown size={11} color={fgVal} />
      )}
    </XStack>
  );
};
