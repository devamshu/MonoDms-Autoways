// components/custom/dashboard/InquiryDonutChart.tsx
import { PieChart } from "react-native-gifted-charts";
import { Text, useTheme, View, XStack, YStack } from "tamagui";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InquirySegment {
  label: string;
  value: number;
  color: string;
}

export interface InquiryDonutChartProps {
  title?: string;
  data?: InquirySegment[];
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_DATA: InquirySegment[] = [
  { label: "Walk-In", value: 560, color: "#F97316" },
  { label: "Telephone", value: 595, color: "#16A34A" },
  { label: "Inbound Call", value: 595, color: "#3B82F6" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Given cumulative start angle, sweep angle, and a radius,
 * returns the (x, y) coordinate of the midpoint on that arc.
 * Angles are in degrees, 0 = top (12 o'clock), clockwise.
 */
const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) => {
  // gifted-charts starts at the right (3 o'clock) and goes clockwise.
  // Adjust so 0° = top: subtract 90.
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

// ── Component ─────────────────────────────────────────────────────────────────

export const InquiryDonutChart = ({
  title = "Natural Inquiry Status",
  data = DEFAULT_DATA,
}: InquiryDonutChartProps) => {
  const theme = useTheme();

  const RADIUS = 120;
  const INNER_RADIUS = 85;
  // Distance from center to the percentage pill center - REDUCED to bring pills closer
  const LABEL_RADIUS = RADIUS; // Was 30, now 15

  // The PieChart SVG is square: side = radius * 2
  // gifted-charts adds some internal padding; cx/cy = RADIUS
  const CX = RADIUS;
  const CY = RADIUS;
  // Container size to give room for outside labels
  const CONTAINER = RADIUS + LABEL_RADIUS - RADIUS + 10;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build cumulative angles to find each slice midpoint
  type SliceInfo = {
    segment: InquirySegment;
    pct: number;
    midAngle: number; // degrees
  };

  const slices: SliceInfo[] = [];
  let cumulative = 0;
  for (const segment of data) {
    const sweep = (segment.value / total) * 360;
    const midAngle = cumulative + sweep / 2;
    slices.push({
      segment,
      pct: Math.round((segment.value / total) * 100),
      midAngle,
    });
    cumulative += sweep;
  }

  // Plain pie data — no labelComponent (we draw our own)
  const pieData = data.map((item) => ({
    value: item.value,
    color: item.color,
  }));

  return (
    <View>
      {/* Title */}
      <Text fontSize="$6" fontWeight="700" color="$color" marginBottom="$4">
        {title}
      </Text>

      {/* Chart + outside labels */}
      <XStack justifyContent="center" marginBottom="$5">
        <View
          width={CONTAINER * 2}
          height={CONTAINER * 2}
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          {/* Donut */}
          <PieChart
            data={pieData}
            donut
            radius={RADIUS}
            innerRadius={INNER_RADIUS}
            focusOnPress={false}
            innerCircleColor={theme.background?.val}
            strokeWidth={3}
            strokeColor={theme.background?.val}
          />

          {/* Percentage pills — absolutely positioned outside each slice */}
          {slices.map(({ segment, pct, midAngle }) => {
            const pos = polarToCartesian(
              CONTAINER, // cx in the container space
              CONTAINER, // cy in the container space
              LABEL_RADIUS,
              midAngle,
            );

            return (
              <View
                key={segment.label}
                position="absolute"
                // Pill width: 59, height: 34 - offset by half to center it on the point
                left={pos.x - 29.5} // 59/2 = 29.5
                top={pos.y - 17} // 34/2 = 17
                width={62}
                height={34}
                backgroundColor="$backgroundSecondary"
                borderRadius={12}
                paddingTop={8}
                paddingRight={16}
                paddingBottom={8}
                paddingLeft={16}
                gap={8}
                shadowColor="$black"
                shadowOpacity={0.1}
                shadowRadius={4}
                shadowOffset={{ width: 0, height: 1 }}
              >
                <Text fontSize={13} fontWeight="700" color={segment.color}>
                  {pct}%
                </Text>
              </View>
            );
          })}
        </View>
      </XStack>

      {/* Legend + values */}
      <XStack justifyContent="space-around" alignItems="flex-start">
        {data.map((item) => (
          <YStack key={item.label} alignItems="center" gap="$1">
            <XStack alignItems="center" gap="$1">
              <View
                width={10}
                height={10}
                borderRadius={5}
                backgroundColor={item.color}
              />
              <Text fontSize="$2" color="$secondaryText" fontWeight="500">
                {item.label}
              </Text>
            </XStack>
            <Text fontSize="$4" fontWeight="800" color="$color">
              {item.value.toLocaleString()}
            </Text>
          </YStack>
        ))}
      </XStack>
    </View>
  );
};
