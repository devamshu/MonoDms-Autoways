import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { toast } from "../../../../../components/auth/toast";
import { Badge } from "../../../components/custom/badge";
import { DatePicker } from "../../../components/custom/datePicker";
import { BottomDrawer } from "../../../components/custom/drawer";
import { AppInput } from "../../../components/custom/input";
import { TimePicker } from "../../../components/custom/timePicker";
import { ccdApi } from "../../features/ccd/api/ccd.api";
import {
  Followup,
  FollowupInquiryOption,
  LogFollowupPayload,
  RescheduleFollowupPayload,
  ScheduleFollowupPayload,
} from "../../features/ccd/types";
import {
  addDays,
  computeDefaultScheduleDueDateTime,
  formatClock,
  formatDayMonth,
  formatDueLabel,
  formatFullDateTime,
  formatTime24,
  LOG_CONTACT_TYPES,
  parseDateString,
  SCHEDULE_CONTACT_TYPES,
  startOfDay,
  toDateString,
} from "./followup.utils";

// ─── Shared building blocks ──────────────────────────────────────────────────

const Label = ({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) => (
  <XStack gap="$1" alignItems="center">
    <Text fontSize="$3" fontWeight="500" color="$color">
      {children}
    </Text>
    {required && (
      <Text color="$error" fontSize="$3">
        *
      </Text>
    )}
  </XStack>
);

const Hint = ({ children }: { children: ReactNode }) => (
  <Text fontSize="$2" color="$secondaryText">
    {children}
  </Text>
);

function OptionPills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T | null | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <XStack
            key={String(opt.value)}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={8}
            borderWidth={1}
            borderColor={selected ? "$primary" : "$inputBorderColor"}
            backgroundColor="$background"
            onPress={() => onChange(opt.value)}
            pressStyle={{ opacity: 0.7 }}
          >
            <Text
              fontSize="$3"
              color={selected ? "$primary" : "$color"}
              fontWeight={selected ? "600" : "400"}
            >
              {opt.label}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}

const toOptions = (values: string[]) =>
  values.map((v) => ({ label: v, value: v }));

// Read-only looking field that opens a picker on tap.
function PickerField({
  value,
  placeholder,
  onPress,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <YStack pointerEvents="none">
        <AppInput
          placeholder={placeholder}
          value={value}
          readOnly
          borderWidth={1}
          borderColor="$inputBorderColor"
          height={48}
        />
      </YStack>
    </TouchableOpacity>
  );
}

function DrawerFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  loading,
  disabled,
  hideConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  loading?: boolean;
  disabled?: boolean;
  hideConfirm?: boolean;
}) {
  const blocked = loading || disabled;
  return (
    <XStack gap="$3" paddingBottom="$4">
      <TouchableOpacity
        onPress={onCancel}
        disabled={loading}
        style={{
          flex: 1,
          height: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 0.5 : 1,
        }}
      >
        <Text fontWeight="600" color="$color">
          {hideConfirm ? "Close" : "Cancel"}
        </Text>
      </TouchableOpacity>
      {!hideConfirm && (
        <TouchableOpacity
          onPress={onConfirm}
          disabled={blocked}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#6362E7",
            alignItems: "center",
            justifyContent: "center",
            opacity: blocked ? 0.5 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600">
              {confirmLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </XStack>
  );
}

const InfoBox = ({
  tone = "primary",
  children,
}: {
  tone?: "primary" | "error" | "neutral";
  children: ReactNode;
}) => (
  <YStack
    padding="$3"
    borderRadius={8}
    borderWidth={tone === "neutral" ? 0 : 1}
    borderColor={tone === "error" ? "$error" : "$primary"}
    backgroundColor={tone === "error" ? "$errorBackground" : "$inputBackground"}
    gap="$1"
  >
    {children}
  </YStack>
);

// ─── Log follow-up ───────────────────────────────────────────────────────────

export interface LogTarget {
  inquiryId: number;
  inquiryName: string;
  inquiryKindId: number | null;
  pending: {
    due_date: string | null;
    contact_type: string;
    is_overdue: boolean;
  } | null;
}

interface LogFollowupDrawerProps {
  open: boolean;
  target: LogTarget | null;
  kinds: { id: number; name: string }[];
  userName: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: LogFollowupPayload) => void;
}

export function LogFollowupDrawer({
  open,
  target,
  kinds,
  userName,
  loading,
  onClose,
  onSubmit,
}: LogFollowupDrawerProps) {
  const [contactType, setContactType] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [kindId, setKindId] = useState<number | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [nextType, setNextType] = useState("Call");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (open && target) {
      /* eslint-disable react-hooks/set-state-in-effect -- the drawer stays mounted, so the form resets each time it opens */
      setContactType(null);
      setRemarks("");
      setKindId(target.inquiryKindId);
      setNextDate(null);
      setNextType("Call");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, target]);

  const handleSubmit = () => {
    if (!target) return;
    if (!contactType) {
      toast.error("Please select a contact type.");
      return;
    }
    if (!remarks.trim()) {
      toast.error("Please enter notes for this follow-up.");
      return;
    }
    onSubmit({
      inquiryId: target.inquiryId,
      contact_type: contactType,
      remarks: remarks.trim(),
      kind: kindId && kindId !== target.inquiryKindId ? kindId : undefined,
      next_followup_date: nextDate ?? undefined,
      next_followup_type: nextDate ? nextType : undefined,
    });
  };

  const pending = target?.pending;
  const kindOptions = kinds.map((k) => ({
    value: k.id,
    label: k.id === target?.inquiryKindId ? `${k.name} (no change)` : k.name,
  }));

  return (
    <BottomDrawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      headerTitle="Log follow-up"
      height={92}
      stickyBottomContent={
        <DrawerFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Save follow-up"
          loading={loading}
        />
      }
    >
      {target && (
        <YStack gap="$4" paddingBottom="$4">
          {pending ? (
            <InfoBox tone={pending.is_overdue ? "error" : "primary"}>
              {pending.is_overdue && <Badge label="Overdue" variant="error" />}
              <Text fontSize="$3" color="$color">
                {target.inquiryName} · {pending.contact_type} ·{" "}
                {pending.due_date
                  ? `${pending.is_overdue ? "was due" : "due"} ${formatDueLabel(pending.due_date)}`
                  : "no due date"}
              </Text>
            </InfoBox>
          ) : (
            <Hint>{target.inquiryName} · No follow-up currently pending</Hint>
          )}

          <YStack gap="$2">
            <Label required>Contact type</Label>
            <OptionPills
              options={toOptions(LOG_CONTACT_TYPES)}
              value={contactType}
              onChange={setContactType}
            />
          </YStack>

          <YStack gap="$2">
            <Label required>Remarks</Label>
            <AppInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="What happened on this follow-up..."
              multiline
              numberOfLines={4}
              height={100}
              borderWidth={1}
              borderColor="$inputBorderColor"
              textAlignVertical="top"
            />
            <Hint>{"Can't be edited after saving. Add a note to correct it."}</Hint>
          </YStack>

          {kindOptions.length > 0 && (
            <YStack gap="$2">
              <Label>Temperature (optional)</Label>
              <OptionPills
                options={kindOptions}
                value={kindId}
                onChange={setKindId}
              />
              <Hint>{"If changed, the enquiry's temperature is updated too."}</Hint>
            </YStack>
          )}

          <YStack gap="$2">
            <Label>Next follow-up date (optional)</Label>
            <PickerField
              value={nextDate ?? ""}
              placeholder="Select next follow-up date"
              onPress={() => setDatePickerOpen(true)}
            />
            {nextDate && (
              <Text
                fontSize="$2"
                color="$primary"
                onPress={() => setNextDate(null)}
              >
                Clear date
              </Text>
            )}
            <DatePicker
              visible={datePickerOpen}
              selectedDate={nextDate ? parseDateString(nextDate) : null}
              // The backend requires a future date, so today is not offered.
              minDate={addDays(startOfDay(new Date()), 1)}
              onClose={() => setDatePickerOpen(false)}
              onDateSelect={(date) => {
                setNextDate(toDateString(date));
                setDatePickerOpen(false);
              }}
            />
          </YStack>

          {nextDate && (
            <YStack gap="$2">
              <Label>Next follow-up type</Label>
              <OptionPills
                options={toOptions(LOG_CONTACT_TYPES)}
                value={nextType}
                onChange={setNextType}
              />
            </YStack>
          )}

          <InfoBox tone="neutral">
            <Text fontSize="$2" color="$color">
              Saving marks this follow-up{" "}
              <Text fontSize="$2" fontWeight="700">
                Done
              </Text>{" "}
              (today {formatClock(new Date())}, {userName}).
              {nextDate
                ? ` A new pending follow-up is created for ${formatDayMonth(parseDateString(nextDate))}, assigned to the enquiry owner. The date must be in the future.`
                : ""}{" "}
              The enquiry status does not change. Book, quote or mark lost from
              the enquiry page.
            </Text>
          </InfoBox>
        </YStack>
      )}
    </BottomDrawer>
  );
}

// ─── Reschedule ──────────────────────────────────────────────────────────────

export interface RescheduleTarget {
  id: number;
  inquiryId: number;
  inquiryName: string;
  inquiryNo: string | null;
  dueDate: string | null;
  contactType: string;
}

interface RescheduleDrawerProps {
  open: boolean;
  target: RescheduleTarget | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: RescheduleFollowupPayload) => void;
}

export function RescheduleDrawer({
  open,
  target,
  loading,
  onClose,
  onSubmit,
}: RescheduleDrawerProps) {
  const [newDate, setNewDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (open && target) {
      /* eslint-disable react-hooks/set-state-in-effect -- the drawer stays mounted, so the form resets each time it opens */
      setNewDate(
        target.dueDate ? toDateString(new Date(target.dueDate)) : null,
      );
      setReason("");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, target]);

  const handleSubmit = () => {
    if (!target || !newDate) {
      toast.error("Please pick a new date.");
      return;
    }
    onSubmit({
      id: target.id,
      due_date: newDate,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <BottomDrawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      headerTitle="Reschedule follow-up"
      height={65}
      stickyBottomContent={
        <DrawerFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Reschedule"
          loading={loading}
          disabled={!newDate}
        />
      }
    >
      {target && (
        <YStack gap="$4" paddingBottom="$4">
          <InfoBox>
            <Text fontSize="$3" color="$color">
              <Text fontSize="$3" color="$secondaryText">
                Enquiry:{" "}
              </Text>
              {target.inquiryName}
              {target.inquiryNo ? ` · ${target.inquiryNo}` : ""}
            </Text>
            <Text fontSize="$3" color="$color">
              <Text fontSize="$3" color="$secondaryText">
                Current due:{" "}
              </Text>
              {target.dueDate ? formatFullDateTime(target.dueDate) : "—"} ·{" "}
              {target.contactType}
            </Text>
          </InfoBox>

          <YStack gap="$2">
            <Label required>New date</Label>
            <PickerField
              value={newDate ?? ""}
              placeholder="Select new date"
              onPress={() => setDatePickerOpen(true)}
            />
            <Hint>Must be in the future.</Hint>
            <DatePicker
              visible={datePickerOpen}
              selectedDate={newDate ? parseDateString(newDate) : null}
              minDate={startOfDay(new Date())}
              onClose={() => setDatePickerOpen(false)}
              onDateSelect={(date) => {
                setNewDate(toDateString(date));
                setDatePickerOpen(false);
              }}
            />
          </YStack>

          <YStack gap="$2">
            <Label>Reason</Label>
            <AppInput
              value={reason}
              onChangeText={setReason}
              placeholder="Why is this being rescheduled?"
              borderWidth={1}
              borderColor="$inputBorderColor"
              height={48}
            />
          </YStack>

          <Hint>The old and new dates are saved in the Activity history.</Hint>
        </YStack>
      )}
    </BottomDrawer>
  );
}

// ─── Schedule (Add Followup) ─────────────────────────────────────────────────

const INQUIRY_STATUS_VARIANT = {
  open: "info",
  booked: "success",
  sold: "success",
  closed: "default",
  lost: "error",
} as const;

interface ScheduleFollowupDrawerProps {
  open: boolean;
  kinds: { id: number; first_followup_offset_minutes?: number | null }[];
  loading: boolean;
  onClose: () => void;
  // Resolves to an error message, or null on success.
  onSubmit: (payload: ScheduleFollowupPayload) => Promise<string | null>;
  // The blocked view's shortcuts into the row-level Log / Reschedule drawers.
  onQuickLog: (inquiry: FollowupInquiryOption, pending: Followup) => void;
  onQuickReschedule: (
    inquiry: FollowupInquiryOption,
    pending: Followup,
  ) => void;
}

interface ScheduleState {
  inquiry: FollowupInquiryOption;
  // Non-null: this inquiry already has a pending follow-up, so scheduling a
  // second one is refused and the block view is shown instead of the form.
  blockedPending: Followup | null;
}

export function ScheduleFollowupDrawer({
  open,
  kinds,
  loading,
  onClose,
  onSubmit,
  onQuickLog,
  onQuickReschedule,
}: ScheduleFollowupDrawerProps) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<FollowupInquiryOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [checking, setChecking] = useState(false);
  const [state, setState] = useState<ScheduleState | null>(null);

  const [contactType, setContactType] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  // Discards a search response that a newer keystroke has already superseded.
  const searchSeq = useRef(0);

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- the drawer stays mounted, so the form resets each time it opens */
      setSearch("");
      setOptions([]);
      setState(null);
      setContactType(null);
      setPurpose("");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open]);

  useEffect(() => {
    if (!open || state) return;
    const seq = ++searchSeq.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- spinner while the debounced search is pending
    setSearching(true);
    const timer = setTimeout(async () => {
      const res = await ccdApi.searchInquiries(search);
      if (seq !== searchSeq.current) return;
      setSearching(false);
      if (res.success && res.data) {
        setOptions(res.data);
      } else {
        toast.error(res.message || "Failed to search inquiries");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [open, state, search]);

  // Looks up the enquiry's pending follow-up, then picks form vs block view.
  const selectInquiry = useCallback(
    async (inquiry: FollowupInquiryOption) => {
      setChecking(true);
      try {
        const res = await ccdApi.fetchFollowups({
          inquiry__id: inquiry.id,
          status: "pending",
          page: 1,
          page_size: 1,
        });
        if (!res.success || !res.data) {
          toast.error(res.message || "Failed to check existing follow-ups");
          return;
        }
        const blockedPending = res.data.results[0] ?? null;
        setState({ inquiry, blockedPending });
        if (!blockedPending) {
          const offset = kinds.find(
            (k) => k.id === inquiry.kind,
          )?.first_followup_offset_minutes;
          const defaults = computeDefaultScheduleDueDateTime(offset);
          setContactType(null);
          setDueDate(defaults.date);
          setDueTime(defaults.time);
          setPurpose("");
        }
      } finally {
        setChecking(false);
      }
    },
    [kinds],
  );

  const handleSubmit = async () => {
    if (!state) return;
    if (!contactType) {
      toast.error("Please select a contact type.");
      return;
    }
    if (!dueDate || !dueTime) {
      toast.error("Please pick a due date and time.");
      return;
    }
    const error = await onSubmit({
      inquiryId: state.inquiry.id,
      contact_type: contactType,
      due_date: dueDate,
      due_time: dueTime,
      purpose: purpose.trim() || undefined,
    });
    if (error === null) return;
    // It may have become pending between the check and this submit; re-run the
    // check so the block view (with its own Log it / Reschedule it) takes over
    // rather than only surfacing the raw failure.
    const recheck = await ccdApi.fetchFollowups({
      inquiry__id: state.inquiry.id,
      status: "pending",
      page: 1,
      page_size: 1,
    });
    const nowPending = recheck.success ? recheck.data?.results[0] : undefined;
    if (nowPending) {
      setState({ inquiry: state.inquiry, blockedPending: nowPending });
    } else {
      toast.error(error);
    }
  };

  const blocked = state?.blockedPending ?? null;
  const isLostOrClosed =
    state?.inquiry.status === "lost" || state?.inquiry.status === "closed";

  let body: ReactNode;
  if (!state) {
    body = (
      <YStack gap="$3" paddingBottom="$4">
        <Label required>Inquiry</Label>
        <AppInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by customer name or inquiry number"
          borderWidth={1}
          borderColor="$inputBorderColor"
          height={48}
          autoCorrect={false}
          disabled={checking}
        />
        {(searching || checking) && (
          <XStack justifyContent="center" padding="$3">
            <Spinner color="$primary" />
          </XStack>
        )}
        {!searching && !checking && options.length === 0 && (
          <Hint>No inquiries found</Hint>
        )}
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            disabled={checking}
            onPress={() => selectInquiry(opt)}
          >
            <YStack
              padding="$3"
              borderRadius={8}
              borderWidth={1}
              borderColor="$inputBorderColor"
              gap="$1"
            >
              <Text fontSize="$3" fontWeight="500" color="$color">
                {opt.inq_no ? `${opt.inq_no} — ${opt.name}` : opt.name}
              </Text>
              {opt.vehicleLabel && (
                <Text fontSize="$2" color="$secondaryText">
                  {opt.vehicleLabel}
                </Text>
              )}
            </YStack>
          </TouchableOpacity>
        ))}
      </YStack>
    );
  } else if (blocked) {
    body = (
      <YStack gap="$4" paddingBottom="$4">
        <Text fontSize="$3" color="$color">
          <Text fontSize="$3" fontWeight="700">
            {state.inquiry.name}
          </Text>{" "}
          already has a pending follow-up ({blocked.contact_type}
          {blocked.due_date
            ? `, due ${formatFullDateTime(blocked.due_date)}`
            : ""}
          ).
        </Text>
        <XStack gap="$3">
          <TouchableOpacity
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#6362E7",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => onQuickLog(state.inquiry, blocked)}
          >
            <Text color="white" fontWeight="600">
              Log it
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#6362E7",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => onQuickReschedule(state.inquiry, blocked)}
          >
            <Text color="$primary" fontWeight="600">
              Reschedule it
            </Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
    );
  } else {
    body = (
      <YStack gap="$4" paddingBottom="$4">
        <InfoBox tone="neutral">
          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <Text fontSize="$4" fontWeight="600" color="$color">
              {state.inquiry.name}
            </Text>
            {state.inquiry.status && (
              <Badge
                label={
                  state.inquiry.status.charAt(0).toUpperCase() +
                  state.inquiry.status.slice(1)
                }
                variant={INQUIRY_STATUS_VARIANT[state.inquiry.status]}
              />
            )}
          </XStack>
          {state.inquiry.vehicleLabel && (
            <Text fontSize="$3" color="$secondaryText">
              {state.inquiry.vehicleLabel}
            </Text>
          )}
        </InfoBox>

        {isLostOrClosed && (
          <InfoBox tone="error">
            <Text fontSize="$3" color="$color">
              This enquiry is{" "}
              {state.inquiry.status === "lost" ? "Lost" : "Closed"}.{" "}
              {"Reopen it if you're working on it again."}
            </Text>
          </InfoBox>
        )}

        <YStack gap="$2">
          <Label required>Contact type</Label>
          <OptionPills
            options={toOptions(SCHEDULE_CONTACT_TYPES)}
            value={contactType}
            onChange={setContactType}
          />
        </YStack>

        <YStack gap="$2">
          <Label required>Due date</Label>
          <PickerField
            value={dueDate ?? ""}
            placeholder="Select due date"
            onPress={() => setDatePickerOpen(true)}
          />
          <DatePicker
            visible={datePickerOpen}
            selectedDate={dueDate ? parseDateString(dueDate) : null}
            minDate={startOfDay(new Date())}
            onClose={() => setDatePickerOpen(false)}
            onDateSelect={(date) => {
              setDueDate(toDateString(date));
              setDatePickerOpen(false);
            }}
          />
        </YStack>

        <YStack gap="$2">
          <Label required>Due time</Label>
          <PickerField
            value={dueTime ? formatTime24(dueTime) : ""}
            placeholder="Select due time"
            onPress={() => setTimePickerOpen(true)}
          />
          {/* Mounted only while open: the picker seeds its draft selection
              from `selectedTime` once, at mount, so a long-lived instance
              would reopen on a stale time after the default changes. */}
          {timePickerOpen && (
            <TimePicker
              visible
              selectedTime={dueTime}
              onClose={() => setTimePickerOpen(false)}
              onTimeSelect={(time24) => setDueTime(time24)}
            />
          )}
        </YStack>

        <YStack gap="$2">
          <Label>Purpose (optional)</Label>
          <AppInput
            value={purpose}
            onChangeText={setPurpose}
            placeholder='e.g. "Collect balance payment"'
            borderWidth={1}
            borderColor="$inputBorderColor"
            height={48}
          />
        </YStack>
      </YStack>
    );
  }

  return (
    <BottomDrawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      headerTitle="Schedule Followup"
      height={88}
      stickyBottomContent={
        <DrawerFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="Schedule"
          loading={loading}
          disabled={!state || checking}
          hideConfirm={!state || !!blocked}
        />
      }
    >
      {body}
    </BottomDrawer>
  );
}
