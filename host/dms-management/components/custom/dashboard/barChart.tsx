// components/custom/dashboard/PipelineBarChart.tsx
import { useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Text, useTheme, View, XStack, YStack } from "tamagui";

export interface PipelineItem {
  label: string;
  value: number;
  color: string;
  labelColor: string;
}

export interface PipelineBarChartProps {
  title?: string;
  data?: PipelineItem[];
  summaryLabel?: string;
  loading?: boolean;
}

const DEFAULT_DATA: PipelineItem[] = [
  { label: "Pending", value: 3722, color: "#6366F1", labelColor: "#6366F1" },
  { label: "Confirmed", value: 14, color: "#EAB308", labelColor: "#EAB308" },
  { label: "Booked", value: 300, color: "#16A34A", labelColor: "#16A34A" },
  { label: "Retail", value: 481, color: "#3B82F6", labelColor: "#3B82F6" },
  { label: "Closed", value: 3525, color: "#DC2626", labelColor: "#DC2626" },
];

const formatLabel = (label: string): string => {
  const words = label.split("_");
  // Get the main word (usually second word for patterns like ON_TEST_DRIVE)
  const mainWord = words.length > 1 ? words[1] : words[0];
  return mainWord.charAt(0).toUpperCase() + mainWord.slice(1).toLowerCase();
};

const SkeletonBar = ({ width }: { width: number }) => (
  <YStack gap="$4">
    <XStack gap="$2" justifyContent="space-around" width={width}>
      {[1, 2, 3, 4, 5].map((i) => (
        <YStack key={i} alignItems="center" gap="$2">
          <View
            height={140}
            width={width / 6}
            backgroundColor="$color2"
            borderRadius="$2"
            opacity={0.5}
          />
          <View
            height={16}
            width={width / 6}
            backgroundColor="$color2"
            borderRadius="$2"
            opacity={0.5}
          />
        </YStack>
      ))}
    </XStack>
    <View
      height={40}
      width={width * 0.4}
      backgroundColor="$color2"
      borderRadius="$2"
      opacity={0.5}
      alignSelf="center"
    />
  </YStack>
);

export const PipelineBarChart = ({
  title = "Pipeline Status",
  data = DEFAULT_DATA,
  summaryLabel = "Total Stock",
  loading = false,
}: PipelineBarChartProps) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const SCREEN_PADDING = 2;
  const CARD_PADDING = 10;
  const chartWidth = width - SCREEN_PADDING * 2 - CARD_PADDING * 2;

  if (loading) {
    return (
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {title}
        </Text>
        <YStack gap="$4">
          <SkeletonBar width={chartWidth} />
        </YStack>
      </YStack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <YStack gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {title}
        </Text>
        <YStack
          gap="$4"
          paddingVertical="$6"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="$3" color="$secondaryText">
            No data available
          </Text>
        </YStack>
      </YStack>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map((d) => d.value));
  const displayMaxValue = Math.max(maxValue, 10);

  const barData = data.map((item) => ({
    value: item.value,
    label: formatLabel(item.label),
    frontColor: item.color,
    topLabelComponent: () => (
      <Text
        fontSize={11}
        fontWeight="700"
        color={item.labelColor}
        marginBottom={4}
        textAlign="center"
      >
        {item.value.toLocaleString()}
      </Text>
    ),
  }));

  return (
    <YStack gap="$5">
      <Text fontSize="$6" fontWeight="600" color="$color">
        {title}
      </Text>

      <YStack gap="$4">
        <BarChart
          data={barData}
          width={chartWidth}
          height={220}
          barWidth={chartWidth / data.length - 18}
          spacing={16}
          initialSpacing={8}
          endSpacing={0}
          hideRules
          hideYAxisText
          xAxisColor="transparent"
          yAxisColor="transparent"
          xAxisLabelTextStyle={{
            color: theme.secondaryText?.val,
            fontSize: 10,
            fontWeight: "400",
          }}
          noOfSections={4}
          maxValue={Math.ceil((displayMaxValue * 1.25) / 100) * 100}
          backgroundColor="transparent"
          isAnimated
          animationDuration={600}
        />
      </YStack>

      <XStack
        justifyContent="center"
        alignItems="center"
        gap="$2"
        paddingTop="$2"
      >
        <Text fontSize="$4" fontWeight="400" color="$secondaryText">
          {summaryLabel}:
        </Text>
        <Text fontSize="$4" fontWeight="500" color="$color">
          {total}
        </Text>
      </XStack>
    </YStack>
  );
};
