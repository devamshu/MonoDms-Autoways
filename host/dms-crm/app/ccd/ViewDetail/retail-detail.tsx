import { useEffect, useMemo, useState } from "react";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { fetchSalesDetail } from "../../../app/features/ccd/store/ccd.thunks";
import { CCDResponse } from "../../../app/features/ccd/types";
import { formatDate } from "../../../app/utils/format/date";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Badge } from "../../../components/custom/badge";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";

interface CCDRetailDetailScreenProps {
  id: string;
}

const formatMoney = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  return `Rs. ${value.toLocaleString()}`;
};

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

/* ----------------------------- Screen ----------------------------- */

export function CCDRetailDetailScreen({ id }: CCDRetailDetailScreenProps) {
  const dispatch = useAppDispatch();
  const {
    currentSalesDetail: salesData,
    salesDetailLoading: loading,
    error,
  } = useAppSelector((state) => state.crmCcd);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (id) {
      dispatch(fetchSalesDetail(id));
    }
  }, [dispatch, id]);

  const ccdResponses = salesData?.ccd_responses || [];

  const ccdSummary = salesData?.ccd_summary || {
    total_responses: 0,
    satisfied_count: 0,
    unsatisfied_count: 0,
    satisfaction_rate: 0,
    last_contacted: null,
    last_call_status: null,
  };

  const salesPersonName = salesData?.sales_person_info
    ? `${salesData.sales_person_info.first_name || ""} ${salesData.sales_person_info.middle_name || ""} ${salesData.sales_person_info.last_name || ""}`
        .replace(/\s+/g, " ")
        .trim()
    : "—";

  const salesPersonMobile = salesData?.sales_person_info?.mobile || "—";
  const salesPersonEmail =
    salesData?.sales_person_info?.personal_email ||
    salesData?.sales_person_info?.emails?.[0]?.email ||
    "—";

  const customerName = salesData?.customer_info?.full_name || "—";
  const formattedSalesDate = salesData?.sales_date
    ? formatDate(salesData.sales_date)
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
          Loading sales details...
        </Text>
      </YStack>
    );
  }

  if (!salesData) {
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
            ? "Couldn't load these sales details. Please try again later."
            : "Sales details not found"}
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
      <UserDetailCard
        title="Sales Information"
        rows={[
          { label: "Sales Date", value: formattedSalesDate },
          { label: "Dealer", value: formatValue(salesData.dealer_name || "—") },
          { label: "Sold Price", value: formatMoney(salesData.sold_price) },
          { label: "Discount", value: formatMoney(salesData.discount_amount) },
          { label: "Actual Price", value: formatMoney(salesData.actual_price) },
          { label: "Customer", value: formatValue(customerName) },
        ]}
      />

      <UserDetailCard
        title="Sales Person"
        rows={[
          { label: "Name", value: formatValue(salesPersonName) },
          { label: "Mobile", value: formatValue(salesPersonMobile) },
          { label: "Email", value: formatValue(salesPersonEmail) },
          {
            label: "Dealer",
            value: formatValue(salesData.sales_person_info?.dealer_name || "—"),
          },
        ]}
      />

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
