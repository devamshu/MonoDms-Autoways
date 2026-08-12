// components/custom/badge.tsx
import { ReactNode } from "react";
import { Text, XStack, useTheme } from "tamagui";

interface BadgeProps {
  label?: string;
  children?: ReactNode;
  variant?: "success" | "error" | "warning" | "info" | "default";
  size?: "sm" | "md" | "lg";
}

const variantConfig = {
  success: {
    bg: "success",
    color: "white",
  },
  error: {
    bg: "error",
    color: "white",
  },
  warning: {
    bg: "pending",
    color: "white",
  },
  info: {
    bg: "ongoing",
    color: "white",
  },
  default: {
    bg: "secondaryText",
    color: "white",
  },
} as const;

const sizeConfig = {
  sm: { px: 10, py: 3, fontSize: 11, borderRadius: 14 },
  md: { px: 14, py: 5, fontSize: 12, borderRadius: 16 },
  lg: { px: 18, py: 7, fontSize: 14, borderRadius: 20 },
} as const;

export function Badge({
  label,
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const theme = useTheme();
  const { bg, color } = variantConfig[variant];
  const { px, py, fontSize, borderRadius } = sizeConfig[size];

  const displayContent = label ?? children;

  return (
    <XStack
      backgroundColor={theme[bg]?.get()}
      paddingHorizontal={px}
      paddingVertical={py}
      borderRadius={borderRadius}
      alignSelf="flex-start"
    >
      <Text fontSize={fontSize} fontWeight="500" color={theme[color]?.get()}>
        {displayContent}
      </Text>
    </XStack>
  );
}

// Utility function to get badge variant based on status
export const getBadgeVariant = (
  status: string | null | undefined,
): BadgeProps["variant"] => {
  if (!status) return "default";

  const statusMap: Record<string, BadgeProps["variant"]> = {
    // Success variants
    approved: "success",
    confirmed: "success",
    paid: "success",
    active: "success",
    connected: "success",
    completed: "success",

    // Error variants
    rejected: "error",
    declined: "error",
    cancelled: "error",
    not_connected: "error",
    failed: "error",

    // Warning variants
    pending: "warning",
    initiated: "warning",
    in_progress: "warning",
    unanswered: "warning",

    // Info variants
    ongoing: "info",
    actual_inquiry: "info",
    false_enquiry: "default",
  };

  const lowerStatus = status.toLowerCase().replace(/\s+/g, "_");
  return statusMap[lowerStatus] ?? "default";
};

export const CallStatusBadge = ({ status }: { status: string }) => {
  let variant: BadgeProps["variant"] = "default";
  let label = status;

  switch (status.toLowerCase()) {
    case "connected":
      variant = "success";
      break;
    case "not connected":
    case "didn't answer":
      variant = "error";
      break;
    default:
      variant = "default";
  }

  return <Badge label={label} variant={variant} size="sm" />;
};

export const InquiryBadge = ({ type }: { type: string }) => {
  let variant: BadgeProps["variant"] = "default";
  let label = type;

  switch (type.toLowerCase()) {
    case "actual inquiry":
      variant = "success";
      break;
    case "false enquiries":
      variant = "error";
      break;
    default:
      variant = "info";
  }

  return <Badge label={label} variant={variant} size="sm" />;
};
