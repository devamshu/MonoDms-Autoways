import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Linking, TouchableOpacity } from "react-native";
import { Download, Plus } from "lucide-react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import { toast } from "../../../components/custom/toast";
import { AppInput } from "../../../components/custom/input";
import { DatePicker } from "../../../components/custom/datePicker";
import { Dropdown, type DropdownOption } from "../../../components/custom/dropdown";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { useEmployees } from "../../../hooks/useEmployees";
import { customerApi } from "../../features/customer/api/customer.api";
import { masterApi } from "../../features/master/api/master.api";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import type {
  ActivityItem,
  Customer,
  CustomerResourceKey,
  DealStatusItem,
  DealerStockItem,
  DiscountRequestItem,
  DocumentItem,
  NoteItem,
  PaymentItem,
  QuotationItem,
  QuotationLineItem,
  SalesAccessoryItem,
  SalesAssignmentRequestItem,
  SalesRecordItem,
  TestDriveItem,
} from "../../features/customer/types";
import type { MasterSparePart } from "../../features/master/types";
import {
  createInquiryDiscount,
  fetchInquiryResource,
  submitSalesAssignment,
  updateInquiryDiscount,
} from "../../features/customer/store/customer.thunks";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";
import { formatNpr } from "../../utils/format/format";
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

  const onRetry = useCallback(
    () => dispatch(fetchInquiryResource({ inquiryId, key })),
    [dispatch, inquiryId, key],
  );

  useEffect(() => {
    if (!state.loaded) dispatch(fetchInquiryResource({ inquiryId, key }));
  }, [dispatch, inquiryId, key, state.loaded]);

  return {
    items: state.items as T[],
    loaded: state.loaded,
    loading: state.loading,
    error: state.error,
    onRetry,
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
      height={48}
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

export function TestDriveView({
  inquiryId,
  onAdd,
}: {
  inquiryId: string;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<TestDriveItem>(
    inquiryId,
    "testDrives",
  );

  return (
    <YStack gap="$3">
      <AddButton label="Schedule Test Drive" onPress={onAdd} />
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
    </YStack>
  );
}

// Matches the web totals table: line = price × qty − discount, floored at 0.
const quotationLineTotal = (line: QuotationLineItem): number =>
  Math.max(
    Number(line.vehicle_price || 0) * Number(line.quantity || 1) -
      Number(line.discount || 0),
    0,
  );

const APPROVAL_LABEL: Record<string, string> = {
  not_required: "Not Required",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

// Web counterpart disables the PDF until approval is resolved (approved or
// not required); mirror that gate.
function QuotationDownloadButton({
  id,
  disabled,
}: {
  id: number;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    try {
      const res = await customerApi.downloadQuotationPdf(id);
      if (res.success) toast.success("Quotation downloaded");
      else toast.error(res.message || "Failed to download quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      height={42}
      borderRadius={10}
      borderWidth={1}
      borderColor="$inputBorderColor"
      backgroundColor="transparent"
      pressStyle={{ opacity: 0.8 }}
      disabled={disabled || loading}
      opacity={disabled ? 0.5 : 1}
      onPress={onPress}
      icon={<Download size={16} color="#4b5563" />}
    >
      <Text fontSize="$3" fontWeight="600" color="$color">
        {loading ? "Downloading..." : "Download PDF"}
      </Text>
    </Button>
  );
}

export function QuotationView({
  inquiryId,
  onAdd,
}: {
  inquiryId: string;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<QuotationItem>(
    inquiryId,
    "quotations",
  );

  return (
    <YStack gap="$3">
      <AddButton label="Add Quotation" onPress={onAdd} />
      <ResourceList {...state} empty={items.length === 0} emptyText="No quotations yet">
        {items.map((quotation) => {
          const status = quotation.approval_status ?? "";
          const total = (quotation.quotation_vehicles ?? []).reduce(
            (sum, line) => sum + quotationLineTotal(line),
            0,
          );
          const rows = [
            { label: "Status", value: APPROVAL_LABEL[status] ?? dash(status) },
            { label: "Total", value: money(total) },
            { label: "Signatory", value: dash(quotation.signatory_name) },
            { label: "Bank", value: dash(quotation.customer_display_name) },
            {
              label: "Vehicles",
              value: String(quotation.quotation_vehicles?.length ?? 0),
            },
            { label: "Created", value: date(quotation.created_at) },
            ...(status === "pending" && quotation.requested_approver_name
              ? [{ label: "Requested", value: quotation.requested_approver_name }]
              : []),
            ...(status === "approved" && quotation.approved_by_name
              ? [{ label: "Approved By", value: quotation.approved_by_name }]
              : []),
          ];

          return (
            <UserDetailCard
              key={quotation.id}
              title={quotation.quotation_no || `Quotation #${quotation.id}`}
              rows={rows}
            >
              <YStack gap="$1">
                <Text fontSize="$3" fontWeight="600" color="$secondaryText">
                  Vehicles
                </Text>
                {(quotation.quotation_vehicles ?? []).map((line) => (
                  <Text key={line.id} fontSize="$3" color="$color">
                    {[line.vehicle_name, line.variant_name, line.color_name, line.model_year]
                      .filter(Boolean)
                      .join(" ") || `Vehicle #${line.id}`}
                    {`  ·  ${money(line.vehicle_price)} × ${line.quantity ?? 1}`}
                    {Number(line.discount || 0)
                      ? `  −  ${money(line.discount)}`
                      : ""}
                  </Text>
                ))}
              </YStack>

              {quotation.terms_and_conditions ? (
                <YStack gap="$1">
                  <Text fontSize="$3" fontWeight="600" color="$secondaryText">
                    Terms & Conditions
                  </Text>
                  <Text fontSize="$3" color="$color">
                    {quotation.terms_and_conditions}
                  </Text>
                </YStack>
              ) : null}

              {quotation.remarks ? (
                <YStack gap="$1">
                  <Text fontSize="$3" fontWeight="600" color="$secondaryText">
                    Remarks
                  </Text>
                  <Text fontSize="$3" color="$color">
                    {quotation.remarks}
                  </Text>
                </YStack>
              ) : null}

              {quotation.rejection_reason ? (
                <YStack gap="$1">
                  <Text fontSize="$3" fontWeight="600" color="$secondaryText">
                    Rejection Reason
                  </Text>
                  <Text fontSize="$3" color="$color">
                    {quotation.rejection_reason}
                  </Text>
                </YStack>
              ) : null}

              <QuotationDownloadButton
                id={quotation.id}
                disabled={status !== "approved" && status !== "not_required"}
              />
            </UserDetailCard>
          );
        })}
      </ResourceList>
    </YStack>
  );
}

export function DocumentView({
  inquiryId,
  resourceKey = "documents",
  onAdd,
}: {
  inquiryId: string;
  resourceKey?: CustomerResourceKey;
  onAdd?: () => void;
}) {
  const { items, ...state } = useResource<DocumentItem>(inquiryId, resourceKey);

  return (
    <YStack gap="$3">
      {onAdd ? <AddButton label="Add Document" onPress={onAdd} /> : null}
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
    </YStack>
  );
}

const money = (value: unknown): string => formatNpr(value);

const numberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const toDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const errorText = (error: unknown, fallback: string): string =>
  typeof error === "string" && error ? error : fallback;

const statusLabel = (status: string): string =>
  status ? status[0].toUpperCase() + status.slice(1) : "—";

// Phase 6 — receipts for a (booked) inquiry. Summary comes off the customer row
// the list already carries; the receipt list comes from the shared resource.
export function PaymentView({
  inquiryId,
  customer,
  onAdd,
}: {
  inquiryId: string;
  customer: Customer;
  onAdd: () => void;
}) {
  const { items, ...state } = useResource<PaymentItem>(inquiryId, "payments");

  const deal = Number(customer.deal_amount ?? 0);
  // Prefer the freshly-loaded list over the row prop the drawer captured at
  // open, so the total is right after adding a payment.
  const paid = state.loaded
    ? items.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    : Number(customer.total_payments_made ?? 0);
  const remaining = Math.max(deal - paid, 0);

  return (
    <YStack gap="$3">
      <UserDetailCard
        title="Payment Summary"
        rows={[
          { label: "Deal Amount", value: money(deal) },
          { label: "Total Paid", value: money(paid) },
          { label: "Remaining", value: money(remaining) },
        ]}
      />
      <AddButton label="Add Payment" onPress={onAdd} />
      <ResourceList {...state} empty={items.length === 0} emptyText="No payments yet">
        {items.map((payment) => (
          <UserDetailCard
            key={payment.id}
            title={`${payment.payment_type_name || `Payment #${payment.id}`} · ${money(payment.amount)}`}
            rows={[
              { label: "Receipt Date", value: date(payment.receipt_date) },
              { label: "Mode", value: dash(payment.payment_mode_name) },
              { label: "Reference", value: dash(payment.payment_information) },
            ]}
          >
            {payment.description ? (
              <Text fontSize="$3" color="$secondaryText">
                {payment.description}
              </Text>
            ) : null}
            {payment.document ? (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(String(payment.document)).catch(() => {})
                }
              >
                <Text fontSize="$3" color="$color" fontWeight="600">
                  Open receipt
                </Text>
              </TouchableOpacity>
            ) : null}
          </UserDetailCard>
        ))}
      </ResourceList>
    </YStack>
  );
}

// ─── Discount (web CRM/Inquiry/PaymentTabs/DiscountTabs) ──────────────────────
// One card: latest-request status + an amount field. A pending request is
// updated in place; otherwise a new one is raised (backend applies it straight
// away when the user may approve, else it pends).
export function DiscountView({ inquiryId }: { inquiryId: string }) {
  const dispatch = useAppDispatch();
  const { items, ...state } = useResource<DiscountRequestItem>(
    inquiryId,
    "discounts",
  );
  const [amount, setAmount] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const latest = items[0] ?? null;
  const status = latest?.status ?? null;
  const applied = status === "approved";

  useEffect(() => {
    if (state.loaded && !initialized) {
      setInitialized(true);
      if (latest) setAmount(String(latest.requested_discount_amount ?? ""));
    }
  }, [state.loaded, initialized, latest]);

  const submit = () => {
    const value = Number(amount);
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      toast.error("Enter a valid discount amount");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    const value = Number(amount);
    setLoading(true);
    try {
      if (status === "pending" && latest) {
        await dispatch(
          updateInquiryDiscount({
            inquiryId,
            requestId: latest.id,
            amount: value,
          }),
        ).unwrap();
        toast.success("Discount amount updated");
      } else {
        const result = await dispatch(
          createInquiryDiscount({ inquiryId, amount: value }),
        ).unwrap();
        toast.success(
          result.applied
            ? "Discount applied successfully"
            : "Discount request submitted for approval",
        );
      }
      setConfirmOpen(false);
    } catch (error) {
      toast.error(errorText(error, "Failed to submit discount"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$3">
      <UserDetailCard
        title="Discount"
        rows={[
          { label: "Status", value: status ? statusLabel(status) : "No request" },
          {
            label: "Requested",
            value: latest ? money(latest.requested_discount_amount) : "—",
          },
          {
            label: "Approved",
            value: latest ? money(latest.given_discount_amount) : "—",
          },
        ]}
      />

      {!applied ? (
        <YStack gap="$2">
          <Text fontSize="$3" fontWeight="500" color="$color">
            Discount Amount
          </Text>
          <AppInput
            placeholder="Enter discount amount (NPR)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Button
            height={48}
            backgroundColor="$primary"
            borderRadius={12}
            pressStyle={{ opacity: 0.8 }}
            onPress={submit}
          >
            <Text color="white" fontWeight="600">
              {status === "pending" ? "Update Discount" : "Request Discount"}
            </Text>
          </Button>
        </YStack>
      ) : null}

      <ResourceList
        {...state}
        empty={items.length === 0}
        emptyText="No discount requests yet"
      >
        {items.map((item) => (
          <UserDetailCard
            key={item.id}
            title={statusLabel(item.status)}
            rows={[
              {
                label: "Requested",
                value: money(item.requested_discount_amount),
              },
              { label: "Approved", value: money(item.given_discount_amount) },
              { label: "Date", value: date(item.created_at) },
            ]}
          >
            {item.remarks ? (
              <Text fontSize="$3" color="$secondaryText">
                {item.remarks}
              </Text>
            ) : null}
          </UserDetailCard>
        ))}
      </ResourceList>

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title={status === "pending" ? "Update Discount" : "Request Discount"}
        description={
          status === "pending"
            ? `Update the requested discount to ${money(Number(amount))}?`
            : `Request a discount of ${money(Number(amount))}? It applies immediately if you can approve discounts, otherwise it needs approval first.`
        }
        confirmText={status === "pending" ? "Update" : "Request"}
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}

// ─── Stock Sales (web CRM/Inquiry/PaymentTabs/StockSalesTabs) ─────────────────
// Pick an available stock for the deal's agreed vehicle, add accessories, then
// submit a sales-assignment request (approval creates the Sale).
export function StockSalesView({
  inquiryId,
  customer,
}: {
  inquiryId: string;
  customer: Customer;
}) {
  const dispatch = useAppDispatch();
  const discounts = useResource<DiscountRequestItem>(inquiryId, "discounts");
  const accessories = useResource<SalesAccessoryItem>(
    inquiryId,
    "salesAccessories",
  );
  const sale = useResource<SalesRecordItem>(inquiryId, "salesRecord");
  const assignment = useResource<SalesAssignmentRequestItem>(
    inquiryId,
    "salesAssignment",
  );

  const salesRecord = sale.items[0] ?? null;
  const latestAssignment = assignment.items[0] ?? null;
  const isStockAlreadyAssigned = !!salesRecord;
  const isPendingApproval = latestAssignment?.status === "pending";
  const rejectedAssignment =
    latestAssignment && latestAssignment.status === "rejected"
      ? latestAssignment
      : null;

  const [stocks, setStocks] = useState<DealerStockItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [spareParts, setSpareParts] = useState<MasterSparePart[]>([]);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [generated, setGenerated] = useState(false);
  const [rows, setRows] = useState<{ rowId: number; sparepart: string }[]>([
    { rowId: 1, sparepart: "" },
  ]);
  const [salesPersonId, setSalesPersonId] = useState("");
  const [salesDate, setSalesDate] = useState(() => toDateValue(new Date()));
  const [dateOpen, setDateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rowCounter = useRef(1);

  const employees = useEmployees(true);

  // Dealer + deal_vehicle are what the backend filters stock by (server-side).
  useEffect(() => {
    const dealer = customer.dealer;
    const dealVehicle = customer.deal_vehicle;
    if (!dealer || dealVehicle == null) return;
    let active = true;
    setStocksLoading(true);
    customerApi
      .fetchAvailableDealerStock(dealer, dealVehicle)
      .then((res) => {
        if (active && res.success && res.data) setStocks(res.data);
      })
      .finally(() => {
        if (active) setStocksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [customer.dealer, customer.deal_vehicle]);

  useEffect(() => {
    let active = true;
    masterApi.fetchSpareParts().then((res) => {
      if (active && res.success && res.data) setSpareParts(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const showGenerated =
    generated || isStockAlreadyAssigned || isPendingApproval;

  const activeStockId: number | null = isPendingApproval
    ? (latestAssignment?.dealer_stock_vehicle ?? null)
    : generated
      ? numberOrNull(selectedStockId)
      : (salesRecord?.dealer_stock_vehicle ?? null);

  const activeStock =
    activeStockId != null
      ? (stocks.find((s) => s.id === activeStockId) ?? null)
      : null;

  const stockLabel = (s: DealerStockItem): string => {
    const type = (
      s.vehicle_type ||
      s.dms_vehicle?.vehicle_type ||
      ""
    ).toUpperCase();
    const id =
      type === "EV" ? s.frame_no || s.chassis_no : s.chassis_no || s.frame_no;
    return id || `Stock #${s.id}`;
  };

  const stockOptions: DropdownOption[] = stocks.map((s) => ({
    label: stockLabel(s),
    value: String(s.id),
  }));
  // A reserved/assigned stock is no longer status=STOCK, so it drops out of the
  // list; synthesise its option so the locked picker still shows an identifier.
  if (activeStockId != null && !stocks.some((s) => s.id === activeStockId)) {
    stockOptions.unshift({
      label: `Stock #${activeStockId}`,
      value: String(activeStockId),
    });
  }

  const sparePartOptions: DropdownOption[] = spareParts.map((sp) => ({
    label: `${sp.name} | ${sp.part_code}`,
    value: String(sp.id),
  }));

  const dealAmount = numberOrNull(customer.deal_amount);
  const bookingAmount = numberOrNull(customer.booking_amount) ?? 0;
  const approvedDiscount =
    discounts.items.find((d) => d.status === "approved") ?? null;
  const discountAmount = approvedDiscount
    ? approvedDiscount.given_discount_amount ||
      approvedDiscount.requested_discount_amount ||
      0
    : null;
  const pendingPayable =
    dealAmount == null
      ? null
      : dealAmount - (discountAmount ?? 0) - bookingAmount;

  const stockDetails = isStockAlreadyAssigned
    ? salesRecord?.vehicle_details
    : latestAssignment?.vehicle_details;
  const stockActualPrice = isStockAlreadyAssigned
    ? salesRecord?.actual_price
    : dealAmount;
  const stockDiscountAmount = isStockAlreadyAssigned
    ? salesRecord?.discount_amount
    : discountAmount;
  const stockPayable = isStockAlreadyAssigned
    ? (salesRecord?.sold_price ?? 0) - bookingAmount
    : pendingPayable;

  const stockInfoItems: { label: string; value: string }[] =
    isStockAlreadyAssigned || isPendingApproval
      ? stockDetails
        ? [
            { label: "Vehicle", value: stockDetails.vehicle_name ?? "—" },
            { label: "Variant", value: stockDetails.variant ?? "—" },
            { label: "Color", value: stockDetails.color ?? "—" },
            { label: "Chassis No", value: stockDetails.chassis_number ?? "—" },
            {
              label: "Manufacturing Year",
              value: stockDetails.manufacturing_year ?? "—",
            },
            { label: "Vehicle Type", value: stockDetails.vehicle_type ?? "—" },
            { label: "Customer Price", value: money(stockActualPrice) },
            { label: "Discount", value: `- ${money(stockDiscountAmount)}` },
            ...(bookingAmount > 0
              ? [{ label: "Booking Paid", value: `- ${money(bookingAmount)}` }]
              : []),
            { label: "Payable", value: money(stockPayable) },
          ]
        : []
      : (() => {
          if (!activeStock) return [];
          const dv = activeStock.dms_vehicle;
          const price = dv?.vehicle_price?.[0] ?? null;
          return [
            { label: "Vehicle", value: dv?.vehicle?.name ?? "—" },
            { label: "Variant", value: dv?.variant?.name ?? "—" },
            { label: "Color", value: dv?.color?.name ?? "—" },
            {
              label: "Manufacturing Year",
              value: dv?.manufacturing_year
                ? String(dv.manufacturing_year)
                : "—",
            },
            {
              label: "Vehicle Type",
              value: dv?.vehicle_type ?? activeStock.vehicle_type ?? "—",
            },
            { label: "Dealer Price", value: money(price?.dealer_price) },
            { label: "Customer Price", value: money(price?.customer_price) },
            { label: "Deal Amount", value: money(dealAmount) },
            ...(approvedDiscount
              ? [{ label: "Discount", value: `- ${money(discountAmount)}` }]
              : []),
            ...(bookingAmount > 0
              ? [{ label: "Booking Paid", value: `- ${money(bookingAmount)}` }]
              : []),
            ...(dealAmount != null
              ? [{ label: "Payable", value: money(pendingPayable) }]
              : []),
          ];
        })();

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { rowId: ++rowCounter.current, sparepart: "" },
    ]);
  const removeRow = (rowId: number) =>
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.rowId !== rowId) : prev,
    );
  const updateRow = (rowId: number, sparepart: string) =>
    setRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, sparepart } : r)),
    );

  const submit = () => {
    if (activeStockId == null) {
      toast.error("Select a stock");
      return;
    }
    if (!salesPersonId) {
      toast.error("Select a sales person");
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = async () => {
    if (activeStockId == null || !salesPersonId) return;
    setSubmitting(true);
    try {
      await dispatch(
        submitSalesAssignment({
          inquiryId,
          payload: {
            inquiry: Number(inquiryId),
            dealer_stock_vehicle: activeStockId,
            sales_person: Number(salesPersonId),
            sales_date: salesDate,
            ...(approvedDiscount
              ? { discount_request: approvedDiscount.id }
              : {}),
          },
          sparepartIds: rows
            .map((r) => Number(r.sparepart))
            .filter((id) => !Number.isNaN(id) && id > 0),
        }),
      ).unwrap();
      toast.success("Sales assignment submitted — pending approval");
      setConfirmOpen(false);
    } catch (error) {
      toast.error(errorText(error, "Failed to submit sales assignment"));
    } finally {
      setSubmitting(false);
    }
  };

  const coreLoading =
    (!sale.loaded && !sale.error) || (!assignment.loaded && !assignment.error);
  if (coreLoading) {
    return (
      <YStack paddingVertical="$10" alignItems="center">
        <ActivityIndicator size="large" color="#888" />
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <UserDetailCard title="Delivery Stock">
        <Dropdown
          placeholder={stocksLoading ? "Loading stock..." : "Select stock"}
          options={stockOptions}
          value={String(activeStockId ?? "")}
          onChange={setSelectedStockId}
          disabled={isStockAlreadyAssigned || isPendingApproval || stocksLoading}
        />
        {!isStockAlreadyAssigned && !isPendingApproval ? (
          <Button
            height={48}
            backgroundColor="$primary"
            borderRadius={12}
            disabled={!selectedStockId}
            opacity={selectedStockId ? 1 : 0.5}
            marginTop="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setGenerated(true)}
          >
            <Text color="white" fontWeight="600">
              Generate
            </Text>
          </Button>
        ) : null}
      </UserDetailCard>

      {isPendingApproval ? (
        <UserDetailCard
          title="Sales assignment pending approval"
          rows={[
            {
              label: "Sales Person",
              value: latestAssignment?.sales_person_name ?? "—",
            },
            { label: "Sales Date", value: latestAssignment?.sales_date ?? "—" },
            {
              label: "Status",
              value: latestAssignment?.status_display ?? "Pending",
            },
          ]}
        />
      ) : rejectedAssignment ? (
        <UserDetailCard
          title="Previous sales assignment rejected"
          rows={[
            {
              label: "Reason",
              value: rejectedAssignment.rejection_reason ?? "—",
            },
          ]}
        />
      ) : null}

      {showGenerated ? (
        <UserDetailCard title="Stock Information" rows={stockInfoItems} />
      ) : null}

      {showGenerated && isStockAlreadyAssigned ? (
        <UserDetailCard title="Accessories & Documents">
          {accessories.loaded && accessories.items.length > 0 ? (
            accessories.items.map((a) => (
              <Text key={a.id} fontSize="$3" color="$color">
                {a.sparepart_name ?? `Accessory #${a.id}`}
                {a.part_code ? ` (${a.part_code})` : ""}
              </Text>
            ))
          ) : (
            <Text fontSize="$3" color="$secondaryText">
              No accessories assigned
            </Text>
          )}
          {/* shortcut: the delivery-sheet PDF is auth-protected and this app has no
              file-system/sharing module, so it can only be viewed from the web CRM. */}
          <Text fontSize="$2" color="$secondaryText" marginTop="$2">
            Delivery sheet PDF: view on the web CRM.
          </Text>
        </UserDetailCard>
      ) : null}

      {showGenerated && !isPendingApproval && !isStockAlreadyAssigned ? (
        <UserDetailCard title="Assign Accessories">
          <YStack gap="$2">
            {rows.map((row) => (
              <XStack key={row.rowId} gap="$2" alignItems="center">
                <YStack flex={1}>
                  <Dropdown
                    placeholder="Select spare part"
                    options={sparePartOptions}
                    value={row.sparepart}
                    onChange={(v) => updateRow(row.rowId, v)}
                  />
                </YStack>
                <TouchableOpacity
                  disabled={rows.length === 1}
                  onPress={() => removeRow(row.rowId)}
                  hitSlop={8}
                >
                  <Text
                    color={rows.length === 1 ? "$secondaryText" : "$error"}
                    fontWeight="600"
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </XStack>
            ))}
            <TouchableOpacity onPress={addRow}>
              <Text color="$primary" fontWeight="600">
                + Add Row
              </Text>
            </TouchableOpacity>
          </YStack>
        </UserDetailCard>
      ) : null}

      {showGenerated && !isPendingApproval && !isStockAlreadyAssigned ? (
        <YStack gap="$3">
          <Dropdown
            label="Sales Person"
            required
            placeholder={
              employees.loading ? "Loading..." : "Select sales person"
            }
            options={employees.options}
            value={salesPersonId}
            onChange={setSalesPersonId}
            disabled={employees.loading}
            loading={employees.loading}
            loadingMore={employees.loadingMore}
            onEndReached={employees.loadMore}
          />

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$color">
              Sales Date
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDateOpen(true)}
            >
              <YStack pointerEvents="none">
                <AppInput placeholder="Select sales date" value={salesDate} />
              </YStack>
            </TouchableOpacity>
            <DatePicker
              visible={dateOpen}
              selectedDate={salesDate ? new Date(salesDate) : null}
              onClose={() => setDateOpen(false)}
              onDateSelect={(d) => {
                setSalesDate(toDateValue(d));
                setDateOpen(false);
              }}
            />
          </YStack>

          <Button
            height={48}
            backgroundColor="$primary"
            borderRadius={12}
            disabled={submitting}
            opacity={submitting ? 0.5 : 1}
            pressStyle={{ opacity: 0.8 }}
            onPress={submit}
          >
            <Text color="white" fontWeight="600">
              Assign Stock
            </Text>
          </Button>
        </YStack>
      ) : null}

      <GenericModal
        isOpen={confirmOpen}
        variant="confirmCancel"
        title="Assign Stock"
        description={
          approvedDiscount
            ? `This inquiry has an approved discount of ${money(discountAmount)}. It will be applied to this sale.`
            : "This submits the stock assignment for approval."
        }
        confirmText="Assign Stock"
        loading={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />
    </YStack>
  );
}
