import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, Linking, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { Button, Text, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import type {
  ActivityItem,
  CustomerResourceKey,
  DealStatusItem,
  DocumentItem,
  NoteItem,
  QuotationItem,
  TestDriveItem,
} from "../../features/customer/types";
import { fetchInquiryResource } from "../../features/customer/store/customer.thunks";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";
import { formatDate } from "../../utils/format/date";

const dash = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const date = (value?: string | null): string =>
  value ? formatDate(value) : "—";

/** One sub-list of the drawer. The drawer itself owns the scroll container. */
function useResource<T>(inquiryId: string, key: CustomerResourceKey) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.crmCustomer.resources[key]);

  useEffect(() => {
    if (!state.loaded) dispatch(fetchInquiryResource({ inquiryId, key }));
  }, [dispatch, inquiryId, key, state.loaded]);

  return {
    items: state.items as T[],
    loaded: state.loaded,
    loading: state.loading,
    error: state.error,
    onRetry: () => dispatch(fetchInquiryResource({ inquiryId, key })),
  };
}

function ResourceList({
  loaded,
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  children,
}: {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (!loaded && (loading || !error)) {
    return (
      <YStack paddingVertical="$10" alignItems="center">
        <ActivityIndicator size="large" color="#888" />
      </YStack>
    );
  }

  if (!loaded && error) {
    return (
      <YStack paddingVertical="$10" alignItems="center" gap="$2">
        <Text color="$secondaryText">{error}</Text>
        <TouchableOpacity onPress={onRetry}>
          <Text color="$color" fontWeight="600">
            Retry
          </Text>
        </TouchableOpacity>
      </YStack>
    );
  }

  if (empty) {
    return (
      <YStack paddingVertical="$10" alignItems="center">
        <Text color="$secondaryText">{emptyText}</Text>
      </YStack>
    );
  }

  return <YStack gap="$3">{children}</YStack>;
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Button
      size="$3"
      backgroundColor="$primary"
      borderRadius={12}
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      icon={<Plus size={16} color="white" />}
    >
      <Text color="white" fontWeight="600">
        {label}
      </Text>
    </Button>
  );
}

export function ActivityView({
  inquiryId,
  onAdd,
}: {
  inquiryId: string;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<ActivityItem>(inquiryId, "activities");

  return (
    <YStack gap="$3">
      <AddButton label="Add Activity" onPress={onAdd} />
      <ResourceList {...state} empty={items.length === 0} emptyText="No activities yet">
        {items.map((item) => (
          <UserDetailCard
            key={item.id}
            title={item.followup_type || (item.is_activity ? "Activity" : "Follow-up")}
            rows={[
              { label: "Date", value: date(item.followup_date) },
              { label: "Time", value: dash(item.time) },
              { label: "Priority", value: dash(item.priority) },
              { label: "Executive", value: dash(item.executive_name) },
            ]}
          >
            {item.followup_details ? (
              <Text fontSize="$3" color="$color">
                {item.followup_details}
              </Text>
            ) : null}
          </UserDetailCard>
        ))}
      </ResourceList>
    </YStack>
  );
}

export function NotesView({
  inquiryId,
  onAdd,
}: {
  inquiryId: string;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<NoteItem>(inquiryId, "notes");

  return (
    <YStack gap="$3">
      <AddButton label="Add Note" onPress={onAdd} />
      <ResourceList {...state} empty={items.length === 0} emptyText="No notes yet">
        {items.map((note) => (
          <UserDetailCard
            key={note.id}
            title={date(note.created_at)}
            rows={
              note.created_by_name
                ? [{ label: "By", value: note.created_by_name }]
                : undefined
            }
          >
            <Text fontSize="$3" color="$color">
              {note.note}
            </Text>
          </UserDetailCard>
        ))}
      </ResourceList>
    </YStack>
  );
}

export function StatusView({
  inquiryId,
  onAdd,
}: {
  inquiryId: string;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<DealStatusItem>(inquiryId, "statuses");

  return (
    <YStack gap="$3">
      <AddButton label="Add Deal Status" onPress={onAdd} />
      <ResourceList {...state} empty={items.length === 0} emptyText="No deal status yet">
        {items.map((item) => (
          <UserDetailCard
            key={item.id}
            title={item.status_name || `Status #${item.id}`}
            rows={[
              { label: "Sub-status", value: dash(item.sub_status_name) },
              { label: "Date", value: date(item.status_date) },
              { label: "By", value: dash(item.created_by_name) },
            ]}
          >
            {item.remarks ? (
              <Text fontSize="$3" color="$color">
                {item.remarks}
              </Text>
            ) : null}
          </UserDetailCard>
        ))}
      </ResourceList>
    </YStack>
  );
}

export function TestDriveView({ inquiryId }: { inquiryId: string }) {
  const { items, ...state } = useResource<TestDriveItem>(
    inquiryId,
    "testDrives",
  );

  return (
    <ResourceList {...state} empty={items.length === 0} emptyText="No test drives yet">
      {items.map((drive) => (
        <UserDetailCard
          key={drive.id}
          title={drive.test_drive_status || `Test Drive #${drive.id}`}
          rows={[
            {
              label: "Vehicle",
              value: drive.vehicle ? `Vehicle #${drive.vehicle}` : "—",
            },
            { label: "Scheduled", value: date(drive.scheduled_date) },
            { label: "End", value: date(drive.end_time) },
            { label: "KMs", value: dash(drive.kms) },
          ]}
        >
          {drive.feedback ? (
            <Text fontSize="$3" color="$color">
              {drive.feedback}
            </Text>
          ) : null}
        </UserDetailCard>
      ))}
    </ResourceList>
  );
}

export function QuotationView({ inquiryId }: { inquiryId: string }) {
  const { items, ...state } = useResource<QuotationItem>(
    inquiryId,
    "quotations",
  );

  return (
    <ResourceList {...state} empty={items.length === 0} emptyText="No quotations yet">
      {items.map((quotation) => (
        <UserDetailCard
          key={quotation.id}
          title={quotation.quotation_no || `Quotation #${quotation.id}`}
          rows={[
            { label: "Status", value: dash(quotation.approval_status) },
            { label: "Approver", value: dash(quotation.requested_approver_name) },
            { label: "Created", value: date(quotation.created_at) },
          ]}
        >
          <YStack gap="$1">
            {(quotation.quotation_vehicles ?? []).map((line) => (
              <Text key={line.id} fontSize="$3" color="$color">
                {[line.vehicle_name, line.variant_name, line.color_name]
                  .filter(Boolean)
                  .join(" ") || `Vehicle #${line.id}`}
                {line.quantity && line.quantity > 1 ? ` × ${line.quantity}` : ""}
              </Text>
            ))}
            {quotation.remarks ? (
              <Text fontSize="$3" color="$secondaryText">
                {quotation.remarks}
              </Text>
            ) : null}
          </YStack>
        </UserDetailCard>
      ))}
    </ResourceList>
  );
}

export function DocumentView({ inquiryId }: { inquiryId: string }) {
  const { items, ...state } = useResource<DocumentItem>(
    inquiryId,
    "documents",
  );

  return (
    <ResourceList {...state} empty={items.length === 0} emptyText="No documents yet">
      {items.map((doc) => {
        const filename = doc.doc
          ? doc.doc.split("/").pop() || `Document #${doc.id}`
          : `Document #${doc.id}`;
        return (
          <UserDetailCard
            key={doc.id}
            title={filename}
            rows={[
              {
                label: "Type",
                value: doc.is_sales_document ? "Sales document" : "Document",
              },
            ]}
          >
            {doc.doc ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(String(doc.doc)).catch(() => {})}
              >
                <Text fontSize="$3" color="$color" fontWeight="600">
                  Open document
                </Text>
              </TouchableOpacity>
            ) : null}
          </UserDetailCard>
        );
      })}
    </ResourceList>
  );
}
