import { useEffect, useMemo, useState } from "react";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { fetchPsfDetail } from "../../../app/features/ccd/store/ccd.thunks";
import { CCDResponse } from "../../../app/features/ccd/types";
import { formatDate } from "../../../app/utils/format/date";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Badge } from "../../../components/custom/badge";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";

interface CCDPsfDetailScreenProps {
  id: string;
}

/* ----------------------------- Helpers ----------------------------- */

const formatMoney = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  return `Rs. ${value.toLocaleString()}`;
};

const staffName = (
  staff?: {
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
  } | null,
): string => {
  if (!staff) return "—";
  return (
    `${staff.first_name || ""} ${staff.middle_name || ""} ${staff.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim() || "—"
  );
};

/* --------------------- CCD response helpers --------------------- */

function isConnected(res: CCDResponse): boolean {
  return res.call_status?.toLowerCase() === "connected";
}

function getCallStatusVariant(
  status: string,
): "success" | "error" | "warning" | "info" | "default" {
  const statusMap: Record<
    string,
    "success" | "error" | "warning" | "info" | "default"
  > = {
    connected: "success",
    "not connected": "error",
    "didnt answer": "warning",
    "switched off": "error",
    "number busy": "warning",
  };
  return statusMap[status?.toLowerCase()] ?? "default";
}

function getInquiryTypeVariant(
  inquiryType?: string,
): "success" | "error" | "warning" | "info" | "default" | null {
  if (!inquiryType) return null;
  const type = inquiryType.toLowerCase();
  if (type.includes("false")) return "warning";
  if (type.includes("actual")) return "success";
  return null;
}

function dotColorFor(res: CCDResponse): string {
  if (!isConnected(res)) {
    return res.call_status?.toLowerCase() === "didnt answer"
      ? "#EA580C"
      : "#DC2626";
  }
  if (res.inquiry_type?.toLowerCase().includes("false")) return "#EA580C";
  return "#16A34A";
}

function falseReasonLabel(res: CCDResponse): string | null {
  if (!res.false_inquiry_type) return null;
  return res.false_inquiry_type.replace(/_/g, " ");
}

/* --------------------------- Response card --------------------------- */

function ResponseCard({ res }: { res: CCDResponse }) {
  const dotColor = useMemo(() => dotColorFor(res), [res]);
  const reason = falseReasonLabel(res);
  const showQA = res.answers && res.answers.length > 0;
  const callStatusVariant = getCallStatusVariant(res.call_status);
  const inquiryTypeVariant = getInquiryTypeVariant(res.inquiry_type);

  return (
    <Card
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      borderWidth={1}
      borderColor="$inputBorderColor"
      shadowColor="$inputBorderColor"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      elevation={2}
    >
      <XStack gap="$3" alignItems="flex-start">
        <YStack
          width={14}
          height={14}
          borderRadius={7}
          backgroundColor={dotColor}
          marginTop="$1.5"
        />
        <YStack flex={1} gap="$2">
          <Text fontSize="$4" fontWeight="700" color="$color">
            {res.created_at ? formatDate(res.created_at) : "Unknown date"}
          </Text>
          <Text fontSize="$3" color="$secondaryText">
            By: {formatValue(res.created_by_name) || "Executive"}
          </Text>
          <XStack gap="$2" flexWrap="wrap" marginTop="$1">
            <Badge
              label={res.call_status || "N/A"}
              variant={callStatusVariant}
              size="sm"
            />
            {inquiryTypeVariant && (
              <Badge
                label={res.inquiry_type!}
                variant={inquiryTypeVariant}
                size="sm"
              />
            )}
          </XStack>
        </YStack>
      </XStack>

      {showQA && (
        <YStack
          marginTop="$3"
          paddingTop="$3"
          borderTopWidth={1}
          borderTopColor="$inputBorderColor"
          gap="$3"
        >
          <Text fontSize="$4" fontWeight="700" color="$primary">
            Q&A Summary:
          </Text>
          {res.answers.map((a, idx) => (
            <YStack key={idx} gap="$1">
              <Text fontSize="$3" color="$color">
                Q: {a.field_label}
              </Text>
              <Text fontSize="$3" color="$color">
                A: {formatValue(a.value)}
              </Text>
            </YStack>
          ))}
        </YStack>
      )}

      {reason && (
        <YStack
          marginTop="$3"
          paddingTop="$3"
          borderTopWidth={1}
          borderTopColor="$inputBorderColor"
          gap="$1.5"
        >
          <Text fontSize="$4" fontWeight="700" color="$primary">
            Reason:
          </Text>
          <Text fontSize="$3" color="$color">
            {reason}
          </Text>
        </YStack>
      )}
    </Card>
  );
}

/* ------------------ Filter tabs (index.tsx style) ------------------ */

type FilterId = "all" | "connected" | "not_connected";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "not_connected", label: "Not Connected" },
];

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterId;
  onChange: (id: FilterId) => void;
}) {
  return (
    <XStack gap="$4">
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        return (
          <XStack
            key={f.id}
            flex={1}
            height={34}
            borderRadius={21}
            backgroundColor={isActive ? "$primary" : "$background"}
            alignItems="center"
            justifyContent="center"
            onPress={() => onChange(f.id)}
            pressStyle={{ opacity: 0.8 }}
            style={{
              shadowColor: "$black",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              color={isActive ? "white" : "#666"}
              fontWeight="600"
              fontSize={14}
            >
              {f.label}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}

export function CCDPsfDetailScreen({ id }: CCDPsfDetailScreenProps) {
  const dispatch = useAppDispatch();
  const {
    currentPsfDetail: psfData,
    psfDetailLoading: loading,
    error,
  } = useAppSelector((state) => state.crmCcd);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (id) {
      dispatch(fetchPsfDetail(id));
    }
  }, [dispatch, id]);

  const ccdResponses = psfData?.ccd_responses || [];
  const ccdSummary = psfData?.ccd_summary || {
    total_responses: 0,
    satisfied_count: 0,
    unsatisfied_count: 0,
    satisfaction_rate: 0,
    last_contacted: null,
    last_call_status: null,
  };

  const vehicle = psfData?.vehicle_info;
  const vehicleName = vehicle?.vehicle
    ? `${vehicle.vehicle.name}${vehicle.variant ? ` ${vehicle.variant.name}` : ""}`
    : "—";

  const filteredResponses = useMemo(() => {
    if (filter === "all") return ccdResponses;
    if (filter === "connected") return ccdResponses.filter(isConnected);
    return ccdResponses.filter((r) => !isConnected(r));
  }, [ccdResponses, filter]);

  if (loading) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Spinner size="large" color="$primary" />
        <Text marginTop="$4" color="$secondaryText">
          Loading job card details...
        </Text>
      </YStack>
    );
  }

  if (!psfData) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
        padding="$4"
      >
        <Text color="$secondaryText" textAlign="center">
          {error
            ? "Couldn't load these job card details. Please try again later."
            : "Job card details not found"}
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      flex={1}
      backgroundColor="$backgroundSecondary"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}
    >
      {/* Job Card Information */}
      <UserDetailCard
        title="Job Card Information"
        rows={[
          { label: "Card No", value: formatValue(psfData.card_no) },
          { label: "Status", value: formatValue(psfData.status || "—") },
          { label: "Priority", value: formatValue(psfData.priority) },
          {
            label: "Service Type",
            value: formatValue(psfData.service_type_name || "—"),
          },
          { label: "Source", value: formatValue(psfData.source_type) },
          {
            label: "Created",
            value: psfData.created_at ? formatDate(psfData.created_at) : "—",
          },
          {
            label: "Closed",
            value: psfData.closed_date ? formatDate(psfData.closed_date) : "—",
          },
          { label: "Dealer", value: formatValue(psfData.dealer_name || "—") },
        ]}
      />

      <UserDetailCard
        title="Customer"
        rows={[
          {
            label: "Name",
            value: formatValue(psfData.customer_info?.full_name),
          },
          {
            label: "Address",
            value: formatValue(psfData.customer_info?.address || "—"),
          },
          {
            label: "City",
            value: formatValue(psfData.customer_info?.city || "—"),
          },
          {
            label: "PAN No",
            value: formatValue(psfData.customer_info?.pan_no || "—"),
          },
        ]}
      />

      {/* Vehicle */}
      <UserDetailCard
        title="Vehicle"
        rows={[
          { label: "Vehicle", value: formatValue(vehicleName) },
          {
            label: "Vehicle No",
            value: formatValue(vehicle?.vehicle_no || "—"),
          },
          { label: "Color", value: formatValue(vehicle?.color?.name || "—") },
          {
            label: "Fuel Type",
            value: formatValue(vehicle?.fuel_type || "—"),
          },
          {
            label: "KMs",
            value: vehicle?.kms != null ? vehicle.kms.toLocaleString() : "—",
          },
          {
            label: "Service Count",
            value: formatValue(vehicle?.service_count?.toString() || "—"),
          },
        ]}
      />

      {/* Service Staff */}
      <UserDetailCard
        title="Service Staff"
        rows={[
          {
            label: "Service Adviser",
            value: staffName(psfData.service_adviser_info),
          },
          { label: "Mechanic", value: staffName(psfData.mechanic_info) },
          {
            label: "Floor Supervisor",
            value: staffName(psfData.floor_supervisor_info),
          },
          { label: "Cleaner", value: staffName(psfData.cleaner_info) },
        ]}
      />

      {/* Billing */}
      <UserDetailCard
        title="Billing"
        rows={[
          { label: "Cost", value: formatMoney(psfData.cost) },
          { label: "Discount", value: formatMoney(psfData.discount_amount) },
          {
            label: "Discount %",
            value:
              psfData.discount_percentage != null
                ? `${psfData.discount_percentage}%`
                : "—",
          },
          { label: "Net Amount", value: formatMoney(psfData.net_amount) },
          { label: "Paid", value: formatMoney(psfData.paid) },
        ]}
      />

      {/* CCD Insights */}
      <UserDetailCard
        title="CCD Insights"
        rows={[
          {
            label: "Total Call Attempts",
            value: ccdSummary.total_responses?.toString() || "0",
          },
          {
            label: "Satisfaction Rate",
            value: ccdSummary.satisfaction_rate
              ? `${ccdSummary.satisfaction_rate}%`
              : "—",
          },
          {
            label: "Last Call Status",
            value: formatValue(ccdSummary.last_call_status || "—"),
          },
        ]}
      />

      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="800" color="$color">
          Inquiries
        </Text>

        <FilterTabs active={filter} onChange={setFilter} />

        <YStack gap="$3" marginTop="$2">
          {filteredResponses.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text color="$secondaryText">No inquiries available</Text>
            </YStack>
          ) : (
            filteredResponses.map((res) => (
              <ResponseCard key={res.id} res={res} />
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
