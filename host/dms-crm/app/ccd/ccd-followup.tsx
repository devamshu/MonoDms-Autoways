import { Plus } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../app/features/hooks";
import { toast } from "../../../../components/auth/toast";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { ScreenScrollView } from "../../../../components/workspace/screen-scroll-view";
import { useFilters } from "../../components/custom/filter/filterContext";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import {
  fetchFollowups,
  fetchFollowupTabCounts,
  logFollowup,
  refreshFollowups,
  rescheduleFollowup,
  scheduleFollowup,
} from "../features/ccd/store/ccd.thunks";
import { fetchMasterInquiryKinds } from "../features/master/store/master.thunks";
import {
  Followup,
  FollowupInquiryOption,
  FollowupListParams,
  LogFollowupPayload,
  RescheduleFollowupPayload,
  ScheduleFollowupPayload,
} from "../features/ccd/types";
import { getFollowupColumns } from "./followup/followup.columns";
import { FollowupDetailScreen } from "./followup/followup-detail";
import {
  LogFollowupDrawer,
  LogTarget,
  RescheduleDrawer,
  RescheduleTarget,
  ScheduleFollowupDrawer,
} from "./followup/followup-drawers";
import {
  FOLLOWUP_TABS,
  FollowupTabKey,
} from "./followup/followup.utils";

const toFilterParams = (
  activeFilters: Record<string, any>,
): FollowupListParams => {
  const params: Record<string, any> = {};
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });
  return params;
};

interface TabPillProps {
  label: string;
  count: number;
  active: boolean;
  urgent: boolean;
  onPress: () => void;
}

const TabPill = memo(function TabPill({
  label,
  count,
  active,
  urgent,
  onPress,
}: TabPillProps) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={999}
      borderWidth={1}
      borderColor={active ? "$primary" : "$inputBorderColor"}
      backgroundColor="$background"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      <Text
        fontSize="$3"
        color={active ? "$primary" : "$color"}
        fontWeight={active ? "600" : "400"}
      >
        {label}
      </Text>
      <XStack
        borderRadius={10}
        paddingHorizontal={7}
        // Overdue's count reads as an urgency signal, so it stays reddish
        // whichever tab is selected; every other chip is neutral.
        backgroundColor={urgent ? "$errorBackground" : "$inputBackground"}
      >
        <Text
          fontSize="$2"
          fontWeight="600"
          color={urgent ? "$error" : "$secondaryText"}
        >
          {count}
        </Text>
      </XStack>
    </XStack>
  );
});

interface FollowupListProps {
  queryParams: FollowupListParams;
  onOpenDetail: (row: Followup) => void;
}

const COLUMNS = getFollowupColumns();

// Tapping a row opens its detail panel, which carries the row's actions (the
// same pattern as the inquiry table).
function FollowupList({ queryParams, onOpenDetail }: FollowupListProps) {
  const dispatch = useAppDispatch();
  const { followups, followupsCount, followupsLoading } = useAppSelector(
    (state) => state.crmCcd,
  );

  // SN continues across pages, so it needs the page the table last asked for.
  const [rowOffset, setRowOffset] = useState(0);
  const rows = useMemo(
    () => followups.map((row, index) => ({ ...row, sn: rowOffset + index + 1 })),
    [followups, rowOffset],
  );

  const handleFetchData = useCallback(
    async (params: FetchParams) => {
      setRowOffset((params.page - 1) * params.limit);
      await dispatch(fetchFollowups(buildTableApiParams(params, queryParams)));
    },
    [dispatch, queryParams],
  );

  return (
    <TableMain
      columns={COLUMNS}
      data={rows}
      totalItems={followupsCount}
      onFetchData={handleFetchData}
      isLoading={followupsLoading}
      emptyMessage="No followup data found"
      keyExtractor={(item) => item.id.toString()}
      onRowPress={onOpenDetail}
      searchPlaceholder="Search Inquiry Followup"
      itemsPerPage={10}
      itemsPerPageOptions={[10, 25, 50]}
      enableSearch
      enablePagination
      enableColumnManagement
      enableSorting={false}
      showCard={false}
    />
  );
}

export function CCDFollowupScreen() {
  const dispatch = useAppDispatch();
  const { open: openPanel } = useSlideOpen();
  const { activeFilters } = useFilters();

  const { followupTabCounts, followupSubmitting } = useAppSelector(
    (state) => state.crmCcd,
  );
  const inquiryKinds = useAppSelector((state) => state.crmMaster.inquiryKinds);
  const profile = useAppSelector((state) => state.crmProfile.profile);

  const [activeTab, setActiveTab] = useState<FollowupTabKey>("today");

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<RescheduleTarget | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFollowupTabCounts());
    if (inquiryKinds.length === 0) dispatch(fetchMasterInquiryKinds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const userName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.username ||
    "You";

  const tab = useMemo(
    () => FOLLOWUP_TABS.find((t) => t.key === activeTab)!,
    [activeTab],
  );

  const filterParams = useMemo(
    () => toFilterParams(activeFilters),
    [activeFilters],
  );

  // The tab wins over the secondary filters on any key they share, so a tab's
  // bucket can never be widened by a stray filter.
  const queryParams = useMemo<FollowupListParams>(
    () => ({ ...filterParams, ...tab.params }),
    [filterParams, tab],
  );

  const openLog = useCallback((target: LogTarget) => {
    setLogTarget(target);
    setLogOpen(true);
  }, []);

  const openReschedule = useCallback((target: RescheduleTarget) => {
    setRescheduleTarget(target);
    setRescheduleOpen(true);
  }, []);

  const handleRowLog = useCallback(
    (row: Followup) =>
      openLog({
        inquiryId: row.inquiry,
        inquiryName: row.inquiry_name || `Inquiry #${row.inquiry}`,
        inquiryKindId: row.inquiry_kind,
        pending: {
          due_date: row.due_date,
          contact_type: row.contact_type ?? "—",
          is_overdue: row.is_overdue,
        },
      }),
    [openLog],
  );

  const handleRowReschedule = useCallback(
    (row: Followup) =>
      openReschedule({
        id: row.id,
        inquiryId: row.inquiry,
        inquiryName: row.inquiry_name || `Inquiry #${row.inquiry}`,
        inquiryNo: row.inquiry_no,
        dueDate: row.due_date,
        contactType: row.contact_type ?? "—",
      }),
    [openReschedule],
  );

  const handleViewDetail = useCallback(
    (row: Followup) => {
      openPanel(
        <FollowupDetailScreen
          followup={row}
          onLog={handleRowLog}
          onReschedule={handleRowReschedule}
        />,
        "Follow-up Details",
      );
    },
    [openPanel, handleRowLog, handleRowReschedule],
  );

  const handleLogSubmit = useCallback(
    async (payload: LogFollowupPayload) => {
      try {
        await dispatch(logFollowup(payload)).unwrap();
        toast.success("Follow-up logged.");
        setLogOpen(false);
      } catch (error) {
        toast.error(
          typeof error === "string" ? error : "Failed to log follow-up",
        );
      }
    },
    [dispatch],
  );

  const handleRescheduleSubmit = useCallback(
    async (payload: RescheduleFollowupPayload) => {
      try {
        await dispatch(rescheduleFollowup(payload)).unwrap();
        toast.success("Follow-up rescheduled.");
        setRescheduleOpen(false);
      } catch (error) {
        toast.error(
          typeof error === "string" ? error : "Failed to reschedule follow-up",
        );
      }
    },
    [dispatch],
  );

  const handleScheduleSubmit = useCallback(
    async (payload: ScheduleFollowupPayload): Promise<string | null> => {
      try {
        await dispatch(scheduleFollowup(payload)).unwrap();
        toast.success("Follow-up scheduled.");
        setScheduleOpen(false);
        return null;
      } catch (error) {
        return typeof error === "string"
          ? error
          : "Failed to schedule follow-up";
      }
    },
    [dispatch],
  );

  // The Schedule block view's shortcuts: hand the enquiry's already-pending
  // follow-up to the same Log / Reschedule drawers a row's own icons open.
  const handleQuickLog = useCallback(
    (inquiry: FollowupInquiryOption, pending: Followup) => {
      setScheduleOpen(false);
      openLog({
        inquiryId: inquiry.id,
        inquiryName: inquiry.name,
        inquiryKindId: inquiry.kind,
        pending: {
          due_date: pending.due_date,
          contact_type: pending.contact_type ?? "—",
          is_overdue: pending.is_overdue,
        },
      });
    },
    [openLog],
  );

  const handleQuickReschedule = useCallback(
    (inquiry: FollowupInquiryOption, pending: Followup) => {
      setScheduleOpen(false);
      openReschedule({
        id: pending.id,
        inquiryId: inquiry.id,
        inquiryName: inquiry.name,
        inquiryNo: inquiry.inq_no,
        dueDate: pending.due_date,
        contactType: pending.contact_type ?? "—",
      });
    },
    [openReschedule],
  );

  const handleRefresh = useCallback(
    async () => {
      await dispatch(refreshFollowups());
    },
    [dispatch],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={handleRefresh}>
        <YStack gap="$3" flex={1}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <XStack gap="$2" paddingVertical="$1">
              {FOLLOWUP_TABS.map((t) => (
                <TabPill
                  key={t.key}
                  label={t.label}
                  count={followupTabCounts?.[t.key] ?? 0}
                  active={t.key === activeTab}
                  urgent={t.key === "overdue"}
                  onPress={() => setActiveTab(t.key)}
                />
              ))}
            </XStack>
          </ScrollView>

          {!!tab.subtitle && (
            <Text fontSize="$2" color="$secondaryText">
              {tab.subtitle}
            </Text>
          )}

          {/* Remounted per tab/filter set: the list owns its page index, and
              carrying page 3 of one bucket into a smaller one would request a
              page that does not exist. Remounting also refetches. */}
          <FollowupList
            key={`${activeTab}:${JSON.stringify(filterParams)}`}
            queryParams={queryParams}
            onOpenDetail={handleViewDetail}
          />
        </YStack>
      </ScreenScrollView>

      <XStack
        position="absolute"
        bottom={100}
        right={20}
        width={56}
        height={56}
        borderRadius={28}
        backgroundColor="$primary"
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.8 }}
        onPress={() => setScheduleOpen(true)}
        zIndex={999}
        accessibilityRole="button"
        accessibilityLabel="Add followup"
      >
        <Plus size={26} color="#fff" />
      </XStack>

      <LogFollowupDrawer
        open={logOpen}
        target={logTarget}
        kinds={inquiryKinds}
        userName={userName}
        loading={followupSubmitting}
        onClose={() => setLogOpen(false)}
        onSubmit={handleLogSubmit}
      />

      <RescheduleDrawer
        open={rescheduleOpen}
        target={rescheduleTarget}
        loading={followupSubmitting}
        onClose={() => setRescheduleOpen(false)}
        onSubmit={handleRescheduleSubmit}
      />

      <ScheduleFollowupDrawer
        open={scheduleOpen}
        kinds={inquiryKinds}
        loading={followupSubmitting}
        onClose={() => setScheduleOpen(false)}
        onSubmit={handleScheduleSubmit}
        onQuickLog={handleQuickLog}
        onQuickReschedule={handleQuickReschedule}
      />
    </YStack>
  );
}
