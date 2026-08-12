// components/custom/dashboard/PipelineBarChart.tsx
import { useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Text, View, XStack, YStack } from "tamagui";

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
}

const DEFAULT_DATA: PipelineItem[] = [
  { label: "Pending", value: 3722, color: "#6366F1", labelColor: "#6366F1" },
  { label: "Confirmed", value: 14, color: "#EAB308", labelColor: "#EAB308" },
  { label: "Booked", value: 300, color: "#16A34A", labelColor: "#16A34A" },
  { label: "Retail", value: 481, color: "#3B82F6", labelColor: "#3B82F6" },
  { label: "Closed", value: 3525, color: "#DC2626", labelColor: "#DC2626" },
];

export const PipelineBarChart = ({
  title = "Pipeline Status",
  data = DEFAULT_DATA,
  summaryLabel = "Total Inquiries",
}: PipelineBarChartProps) => {
  const { width } = useWindowDimensions();

  const SCREEN_PADDING = 24;
  const CARD_PADDING = 16;
  const chartWidth = width - SCREEN_PADDING * 2 - CARD_PADDING * 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map((d) => d.value));

  const barData = data.map((item) => ({
    value: item.value,
    label: item.label,
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
    <View>
      {/* Title */}
      <Text fontSize="$6" fontWeight="600" color="$gray12">
        {title}
      </Text>

      {/* Bar Chart */}
      <YStack>
        <BarChart
          data={barData}
          width={chartWidth}
          height={220}
          barWidth={chartWidth / data.length - 16}
          spacing={16}
          initialSpacing={8}
          endSpacing={0}
          hideRules
          hideYAxisText
          xAxisColor="#E5E7EB"
          yAxisColor="transparent"
          xAxisLabelTextStyle={{
            color: "#6B7280",
            fontSize: 11,
            fontWeight: "500",
          }}
          noOfSections={4}
          maxValue={Math.ceil((maxValue * 1.25) / 100) * 100}
          backgroundColor="transparent"
          isAnimated
          animationDuration={600}
        />
      </YStack>

      {/* Summary */}
      <XStack
        justifyContent="center"
        alignItems="center"
        gap="$2"
        paddingTop="$3"
        borderTopWidth={1}
        borderTopColor="$borderThinColor"
      >
        <Text fontSize="$4" fontWeight="400" color="#495A69">
          {summaryLabel}:
        </Text>
        <Text fontSize="$4" fontWeight="500" color="#1E2F65">
          {total}
        </Text>
      </XStack>
    </View>
  );
};
