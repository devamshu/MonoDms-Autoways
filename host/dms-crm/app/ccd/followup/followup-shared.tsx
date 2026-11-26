import { ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { BadgeProps } from "../../../components/custom/badge";
import { Followup, FollowupStatus } from "../../features/ccd/types";
import {
  daysBetween,
  formatDayMonth,
  formatRelativeDue,
  formatShortDateTime,
  startOfDay,
} from "./followup.utils";

// Same palette as the web Followup page's kind tag.
export const KIND_VARIANT: Record<string, BadgeProps["variant"]> = {
  Hot: "error",
  Warm: "warning",
  Cold: "info",
};

export const STATUS_BADGE: Record<
  FollowupStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  pending: { label: "Pending", variant: "warning" },
  done: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export const dash = (value?: string | null) =>
  value && value.trim() ? value : "—";

// When a row was actually done: its logged date + time when present, else the
// last-modified stamp (the only timestamp a row without a followup_date has).
export const completedAt = (row: Followup) =>
  row.followup_date
    ? new Date(`${row.followup_date}T${row.time ?? "00:00:00"}`)
    : new Date(row.updated_at);

export const rescheduleNote = (row: Followup) =>
  row.reschedule_info
    ? `rescheduled ${row.reschedule_info.count === 1 ? "once" : `${row.reschedule_info.count} times`} (was ${formatDayMonth(new Date(row.reschedule_info.original_due_date))})`
    : null;

// Keyed off each ROW's own status, not the active tab: "All" mixes pending,
// done and cancelled. The bold line is always the originally scheduled time
// (completing or auto-cancelling never clears due_date); the line below says
// where the row actually stands now.
export function describeDue(
  row: Followup,
  includeReschedule = true,
): {
  text: string;
  tone: "error" | "muted";
} {
  const note = rescheduleNote(row);
  const suffix = includeReschedule && note ? ` · ${note}` : "";
  if (row.status === "pending") {
    if (row.is_overdue && row.due_date) {
      const days = daysBetween(
        startOfDay(new Date(row.due_date)),
        startOfDay(new Date()),
      );
      return {
        text:
          days > 0 ? `${days} day${days === 1 ? "" : "s"} overdue` : "overdue",
        tone: "error",
      };
    }
    return {
      text: row.due_date ? formatRelativeDue(row.due_date) : "",
      tone: "muted",
    };
  }
  if (row.status === "done") {
    return {
      text: `Done ${formatShortDateTime(completedAt(row))}${suffix}`,
      tone: "muted",
    };
  }
  return {
    text: `Cancelled ${formatShortDateTime(row.updated_at)}${suffix}`,
    tone: "muted",
  };
}

// What to show as "remarks" for a row. A pending row's own details are only a
// "Scheduled follow-up." placeholder, so it shows what the customer last said;
// a cancelled row shows why it was cancelled.
export const remarksFor = (row: Followup) =>
  (row.status === "pending"
    ? row.last_contact_remarks
    : row.status === "cancelled"
      ? row.cancellation_reason
      : row.followup_details) || "";

export const vehicleLines = (row: Followup) =>
  (row.vehicle_details ?? []).map((v) => ({
    id: v.id,
    title: [v.vehicle_name, v.variant_name].filter(Boolean).join(" "),
    subtitle: [v.color_name, v.manufacturing_year].filter(Boolean).join(" · "),
  }));

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <XStack gap="$3" alignItems="flex-start">
      <Text fontSize="$2" color="$secondaryText" width={78} paddingTop={2}>
        {label}
      </Text>
      <YStack flex={1}>{children}</YStack>
    </XStack>
  );
}

export function ActionButton({
  label,
  icon,
  primary,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#6362E7",
        backgroundColor: primary ? "#6362E7" : "transparent",
      }}
    >
      {icon}
      <Text
        fontSize="$3"
        fontWeight="600"
        color={primary ? "white" : "$primary"}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
