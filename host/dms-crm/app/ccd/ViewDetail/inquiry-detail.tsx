import { useEffect, useMemo, useState } from "react";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { CCDResponse } from "../../../app/features/ccd/types";
import { clearInquiryDetail } from "../../../app/features/customer/store/customer.slice";
import { fetchInquiryDetail } from "../../../app/features/customer/store/customer.thunks";
import { formatDate } from "../../../app/utils/format/date";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Badge } from "../../../components/custom/badge";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";

interface CCDInquiryDetailScreenProps {
  id: string;
}

const getDaysSince = (dateString: string): string => {
  if (!dateString) return "—";
  const lastContacted = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastContacted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
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

/* ------------------ Filter tabs ------------------ */

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
            borderWidth={1}
            borderColor={isActive ? "$primary" : "$inputBorderColor"}
            alignItems="center"
            justifyContent="center"
            onPress={() => onChange(f.id)}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text
              color={isActive ? "white" : "$secondaryText"}
              fontWeight="600"
              fontSize={13}
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

interface ExtendedInquiryDetail {
  id: number;
  name: string;
  contact: string;
  email: string | any[];
  address: string;
  gender: string | null;
  inquiry_date: string;
  dealer_name?: string | null;
  inquiry_source_name?: string | null;
  ccd_responses: CCDResponse[];
  ccd_summary: {
    total_responses: number;
    satisfied_count: number;
    unsatisfied_count: number;
    satisfaction_rate: number;
    last_contacted: string | null;
    last_call_status: string | null;
  };
  contact_details: {
    primary_contact: string;
    primary_email: string;
    phones: Array<{ phone: string }>;
    emails: Array<{ email: string }>;
  };
  assigned_to_info?: {
    first_name: string;
    last_name: string;
  };
}

export function CCDInquiryDetailScreen({ id }: CCDInquiryDetailScreenProps) {
  const dispatch = useAppDispatch();
  const { currentInquiryDetail: inquiryData, inquiryDetailLoading: loading } =
    useAppSelector((state) => state.crmCustomer);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (id) {
      dispatch(clearInquiryDetail());
      dispatch(fetchInquiryDetail(id));
    }
  }, [dispatch, id]);

  const data = inquiryData as ExtendedInquiryDetail | null;

  const ccdResponses = data?.ccd_responses || [];
  const ccdSummary = data?.ccd_summary || {
    total_responses: 0,
    satisfied_count: 0,
    unsatisfied_count: 0,
    satisfaction_rate: 0,
    last_contacted: null,
    last_call_status: null,
  };
  const contactDetails = data?.contact_details || {
    primary_contact: "",
    primary_email: "",
    phones: [],
    emails: [],
  };

  const primaryPhone =
    contactDetails.phones?.[0]?.phone || data?.contact || "N/A";

  const getPrimaryEmail = () => {
    if (typeof data?.email === "string") return data.email;
    if (Array.isArray(data?.email) && data.email.length > 0) {
      const firstEmail = data.email[0] as any;
      return firstEmail?.email || "N/A";
    }
    return contactDetails.emails?.[0]?.email || "N/A";
  };

  const primaryEmail = getPrimaryEmail();

  const executiveName = data?.assigned_to_info
    ? `${data.assigned_to_info.first_name || ""} ${data.assigned_to_info.last_name || ""}`.trim()
    : "—";

  const formattedInquiryDate = data?.inquiry_date
    ? formatDate(data.inquiry_date)
    : "—";

  const daysSinceLastContact = useMemo(() => {
    if (!ccdSummary.last_contacted) return null;
    return getDaysSince(ccdSummary.last_contacted);
  }, [ccdSummary.last_contacted]);

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
          Loading inquiry details...
        </Text>
      </YStack>
    );
  }

  if (!data) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">Inquiry not found</Text>
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
        title="Customer Information"
        rows={[
          { label: "Customer Name", value: formatValue(data.name) },
          { label: "Inquiry Date", value: formattedInquiryDate },
          { label: "Mobile", value: primaryPhone },
          { label: "Email", value: primaryEmail },
          { label: "Executive", value: executiveName },
          { label: "Dealer", value: formatValue(data.dealer_name || "—") },
          {
            label: "Source",
            value: formatValue(data.inquiry_source_name || "—"),
          },
          { label: "Address", value: formatValue(data.address) },
          { label: "Gender", value: formatValue(data.gender || "—") },
        ]}
      />

      <UserDetailCard
        title="Lead Insights"
        rows={[
          {
            label: "Total Call Attempts",
            value: ccdSummary.total_responses?.toString() || "0",
          },
          {
            label: "Last Contacted",
            value: daysSinceLastContact || "—",
          },
          {
            label: "Satisfaction Rate",
            value: ccdSummary.satisfaction_rate
              ? `${ccdSummary.satisfaction_rate}%`
              : "—",
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
