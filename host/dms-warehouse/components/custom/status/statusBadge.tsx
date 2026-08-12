import { ReactNode } from "react";
import { Text, XStack, type XStackProps } from "tamagui";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "active"
  | "inactive"
  | "default";

export type StatusSize = "small" | "medium" | "large";

interface StatusBadgeProps extends XStackProps {
  status: StatusType;
  label?: string;
  size?: StatusSize;
  showDot?: boolean;
  dotColor?: string;
  customColors?: {
    bg: string;
    text: string;
    dot: string;
  };
  icon?: ReactNode;
}

const statusConfig: Record<
  StatusType,
  { bg: string; text: string; dot: string; defaultLabel: string }
> = {
  success: {
    bg: "$green2",
    text: "$green10",
    dot: "$green10",
    defaultLabel: "Success",
  },
  error: {
    bg: "$red2",
    text: "$red10",
    dot: "$red10",
    defaultLabel: "Error",
  },
  warning: {
    bg: "$yellow2",
    text: "$yellow10",
    dot: "$yellow10",
    defaultLabel: "Warning",
  },
  info: {
    bg: "$blue2",
    text: "$blue10",
    dot: "$blue10",
    defaultLabel: "Info",
  },
  pending: {
    bg: "$orange2",
    text: "$orange10",
    dot: "$orange10",
    defaultLabel: "Pending",
  },
  processing: {
    bg: "$purple2",
    text: "$purple10",
    dot: "$purple10",
    defaultLabel: "Processing",
  },
  completed: {
    bg: "$green2",
    text: "$green10",
    dot: "$green10",
    defaultLabel: "Completed",
  },
  cancelled: {
    bg: "$gray2",
    text: "$gray10",
    dot: "$gray10",
    defaultLabel: "Cancelled",
  },
  active: {
    bg: "$green2",
    text: "$green10",
    dot: "$green10",
    defaultLabel: "Active",
  },
  inactive: {
    bg: "$gray2",
    text: "$gray10",
    dot: "$gray10",
    defaultLabel: "Inactive",
  },
  default: {
    bg: "$gray2",
    text: "$gray11",
    dot: "$gray11",
    defaultLabel: "Unknown",
  },
};

const sizeConfig: Record<
  StatusSize,
  {
    paddingVertical: number;
    paddingHorizontal: number;
    fontSize: number;
    dotSize: number;
    gap: number;
  }
> = {
  small: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontSize: 11,
    dotSize: 6,
    gap: 4,
  },
  medium: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 12,
    dotSize: 8,
    gap: 6,
  },
  large: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    fontSize: 14,
    dotSize: 10,
    gap: 8,
  },
};

export function StatusBadge({
  status,
  label,
  size = "medium",
  showDot = true,
  dotColor,
  customColors,
  icon,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.default;
  const sizes = sizeConfig[size];

  const bgColor = customColors?.bg || config.bg;
  const textColor = customColors?.text || config.text;
  const dotBgColor = dotColor || customColors?.dot || config.dot;

  const displayLabel = label || config.defaultLabel;

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      backgroundColor={bgColor}
      paddingTop={6}
      paddingBottom={6}
      paddingLeft={12}
      paddingRight={12}
      gap={8}
      borderRadius={12}
      borderWidth={1}
      borderColor={textColor}
      opacity={1}
      alignSelf="flex-start"
      {...props}
    >
      {showDot && (
        <XStack
          width={sizes.dotSize}
          height={sizes.dotSize}
          borderRadius={sizes.dotSize}
          backgroundColor={dotBgColor}
        />
      )}

      {icon && icon}

      <Text
        fontSize={sizes.fontSize}
        fontWeight="500"
        color={textColor}
        lineHeight={sizes.fontSize * 1.5}
      >
        {displayLabel}
      </Text>
    </XStack>
  );
}
