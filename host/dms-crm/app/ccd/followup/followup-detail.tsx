import { CalendarClock, ClipboardCheck } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { useSlideOpen } from "../../../../../components/auth/slideOpen";
import { Badge } from "../../../components/custom/badge";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";
import { ccdApi } from "../../features/ccd/api/ccd.api";
import { Followup } from "../../features/ccd/types";
import {
  ActionButton,
  completedAt,
  dash,
  describeDue,
  KIND_VARIANT,
  remarksFor,
  STATUS_BADGE,
  vehicleLines,
} from "./followup-shared";
import { formatFullDateTime } from "./followup.utils";

const HISTORY_PAGE_SIZE = 50;

interface FollowupDetailScreenProps {
  followup: Followup;
  onLog: (row: Followup) => void;
  onReschedule: (row: Followup) => void;
}

// The panel a followup row opens (as the inquiry table does for an inquiry):
// the row's full detail, the actions available on it, then every follow-up on
// the enquiry. Web splits these between the row's icons and the enquiry's
// Followup tab; on mobile the row tap is the single entry point.
export function FollowupDetailScreen({
  followup,
  onLog,
  onReschedule,
}: FollowupDetailScreenProps) {
  const { close } = useSlideOpen();
  const [history, setHistory] = useState<Followup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    ccdApi
      .fetchFollowups({
        inquiry__id: followup.inquiry,
        page: 1,
        page_size: HISTORY_PAGE_SIZE,
        ordering: "-created_at",
      })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) setHistory(res.data.results);
        else setError(res.message || "Failed to load follow-up history");
      });
    return () => {
      active = false;
    };
  }, [followup.inquiry]);

  return (
    <ScrollView
      flex={1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      <FollowupSummary row={followup} />

      {/* A done/cancelled row is immutable; only a pending one can be acted on.
          The panel closes first so the drawer opens over the list. */}
      {followup.status === "pending" && (
        <XStack gap="$3">
          <ActionButton
            label="Log follow-up"
            primary
            icon={<ClipboardCheck size={18} color="#fff" />}
            onPress={() => {
              close();
              onLog(followup);
            }}
          />
          <ActionButton
            label="Reschedule"
            icon={<CalendarClock size={18} color="#6362E7" />}
            onPress={() => {
              close();
              onReschedule(followup);
            }}
          />
        </XStack>
      )}

      <Card
        backgroundColor="$background"
        borderRadius="$4"
        padding="$4"
        borderWidth={1}
        borderColor="$inputBorderColor"
      >
        <Text fontSize="$4" fontWeight="700" color="$color" marginBottom="$3">
          Follow-up history
        </Text>
        {history === null && !error && (
          <XStack justifyContent="center" padding="$3">
            <Spinner color="$primary" />
          </XStack>
        )}
        {!!error && (
          <Text fontSize="$3" color="$error">
            {error}
          </Text>
        )}
        {history?.length === 0 && (
          <Text fontSize="$3" color="$secondaryText">
            No follow-ups recorded.
          </Text>
        )}
        <YStack gap="$3">
          {history?.map((h) => (
            <HistoryItem key={h.id} row={h} current={h.id === followup.id} />
          ))}
        </YStack>
      </Card>
    </ScrollView>
  );
}

// Same label-left / value-right rows as the other detail pages, except a value
// may wrap (remarks, vehicle) or be a badge instead of being cut to one line.
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$4">
      <Text fontSize="$3" color="$secondaryText" paddingTop={2}>
        {label}
      </Text>
      <YStack flex={1} alignItems="flex-end">
        {typeof children === "string" ? (
          <Text fontSize="$3" fontWeight="600" color="$color" textAlign="right">
            {children}
          </Text>
        ) : (
          children
        )}
      </YStack>
    </XStack>
  );
}

function FollowupSummary({ row }: { row: Followup }) {
  const status = STATUS_BADGE[row.status];
  const due = describeDue(row);
  const vehicles = vehicleLines(row)
    .map((v) => [v.title, v.subtitle].filter(Boolean).join(" · "))
    .filter(Boolean);
  const overdue = row.status === "pending" && row.is_overdue;

  return (
    <UserDetailCard title="Follow-up Information">
      <DetailRow label="Customer">
        {row.inquiry_name || `Inquiry #${row.inquiry}`}
      </DetailRow>
      <DetailRow label="Inquiry No">{dash(row.inquiry_no)}</DetailRow>
      <DetailRow label="Contact">{dash(row.inquiry_contact)}</DetailRow>
      <DetailRow label="Status">
        <Badge label={status.label} variant={status.variant} />
      </DetailRow>
      <DetailRow label="Kind">
        {row.inquiry_kind_name ? (
          <Badge
            label={row.inquiry_kind_name}
            variant={KIND_VARIANT[row.inquiry_kind_name] ?? "default"}
          />
        ) : (
          "—"
        )}
      </DetailRow>
      <DetailRow label="Due">
        {row.due_date ? (
          <Text
            fontSize="$3"
            fontWeight="700"
            textAlign="right"
            color={overdue ? "$error" : "$color"}
          >
            {formatFullDateTime(row.due_date)}
          </Text>
        ) : (
          "—"
        )}
      </DetailRow>
      {!!due.text && (
        <DetailRow label="Timing">
          <Text
            fontSize="$3"
            fontWeight="600"
            textAlign="right"
            color={due.tone === "error" ? "$error" : "$color"}
          >
            {due.text}
          </Text>
        </DetailRow>
      )}
      {row.status === "done" && (
        <DetailRow label="Done On">
          {formatFullDateTime(completedAt(row))}
        </DetailRow>
      )}
      <DetailRow label="Type">{dash(row.contact_type)}</DetailRow>
      <DetailRow label="Executive">{dash(row.executive_name)}</DetailRow>
      <DetailRow label={row.is_deal_vehicle ? "Deal Vehicle" : "Vehicle"}>
        {vehicles.length ? vehicles.join(", ") : "—"}
      </DetailRow>
      <DetailRow label="Remarks">{remarksFor(row) || "—"}</DetailRow>
      {!!row.reschedule_reason && (
        <DetailRow label="Reschedule Reason">{row.reschedule_reason}</DetailRow>
      )}
    </UserDetailCard>
  );
}

function HistoryItem({ row, current }: { row: Followup; current: boolean }) {
  const status = STATUS_BADGE[row.status];
  const when =
    row.status === "done"
      ? `Done ${formatFullDateTime(completedAt(row))}`
      : row.due_date
        ? `Due ${formatFullDateTime(row.due_date)}`
        : "—";
  const remarks = remarksFor(row);

  return (
    <YStack
      gap="$1.5"
      padding="$3"
      borderRadius={10}
      borderWidth={current ? 2 : 1}
      borderColor={current ? "$primary" : "$inputBorderColor"}
    >
      <XStack justifyContent="space-between" alignItems="center" gap="$2">
        <Text fontSize="$3" fontWeight="600" color="$color" flexShrink={1}>
          {dash(row.contact_type)}
        </Text>
        <Badge label={status.label} variant={status.variant} />
      </XStack>
      <Text fontSize="$2" color="$secondaryText">
        {when} · {dash(row.executive_name)}
      </Text>
      {!!remarks && (
        <Text fontSize="$3" color="$color">
          {remarks}
        </Text>
      )}
    </YStack>
  );
}
