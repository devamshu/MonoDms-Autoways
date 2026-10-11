import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  Lock,
  MessageSquare,
  Pencil,
  Repeat,
  Shuffle,
  StickyNote,
  Undo2,
  Wallet,
  List,
} from "lucide-react-native";
import { BottomDrawer } from "../../../components/custom/drawer";
import { Badge } from "../../../components/custom/badge";
import { CustomerDetailContent } from "./CustomerDetailScreen";
import {
  ActivityView,
  DocumentView,
  NotesView,
  QuotationView,
  StatusView,
  TestDriveView,
} from "./views";
import {
  AddActivityForm,
  AddDealStatusForm,
  AddNoteForm,
  BookForm,
  ChangeKindForm,
  ConvertToDealForm,
  EditCustomerForm,
  ReviewForm,
} from "./forms";
import { GenericModal } from "../../../components/custom/model/genericModal";
import {
  cancelInquiryKindChange,
  requestInquiryClosure,
  revertInquiryStage,
} from "../../features/customer/store/customer.thunks";
import { toast } from "../../../components/custom/toast";
import { clearCustomerResources } from "../../features/customer/store/customer.slice";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import type { Customer } from "../../features/customer/types";

// Mirrors Inquiry.revert_stage() on the backend (see web CRM/Inquiry).
const REVERTIBLE_STATUSES = new Set([
  "Booked",
  "Booking Rejected",
  "Booking Pending",
  "Converted to Deal",
]);

const previousStageName = (status: string): string =>
  status === "Converted to Deal" ? "Open" : "Converted to Deal";

// ─── Permission gating ────────────────────────────────────────────────────────
// Compact port of the web permission engine (core/permissions/permissionMap).
// Codenames are Django's `<action>_<model>`; /users/auth/me/ groups them by
// model. Kept local because the drawer is the only screen that gates actions.
const CRUD_ACTIONS = ["view", "add", "change", "delete"] as const;

function buildPermissionMap(
  permissions?: Record<string, string[]>,
): Record<string, Record<string, boolean>> {
  const map: Record<string, Record<string, boolean>> = {};
  for (const [model, codenames] of Object.entries(permissions ?? {})) {
    const actions: Record<string, boolean> = {};
    for (const codename of codenames) {
      const prefix = CRUD_ACTIONS.find((p) => codename === `${p}_${model}`);
      actions[prefix ?? codename] = true;
    }
    map[model] = actions;
  }
  return map;
}

// View-implies-others, same as the web engine.
function canPerformAction(
  map: Record<string, Record<string, boolean>>,
  isSuperuser: boolean,
  module: string,
  action: string,
): boolean {
  if (isSuperuser) return true;
  const actions = map[module];
  if (!actions) return false;
  if (action === "view") return !!actions.view;
  return !!actions.view && !!actions[action];
}

// Mirrors the confirmation copy in web CRM/Inquiry.
function confirmDescription(
  customer: Customer | null,
  action: "revert" | "closure" | "cancelKind" | null,
  status: string,
): string {
  if (!customer || !action) return "";
  if (action === "cancelKind") {
    return "This will discard the pending kind change request for this inquiry.";
  }
  if (action === "revert") {
    return status === "Converted to Deal"
      ? "This will move the inquiry back to Open, undoing its conversion to a deal."
      : "This will undo the inquiry's current booking (including its booking payment record) and move it back to Converted to Deal.";
  }
  const deal =
    customer.deal_amount != null ? String(Number(customer.deal_amount)) : "N/A";
  const paid = String(customer.total_payments_made ?? 0);
  return `Deal Amount: ${deal}\nTotal Paid: ${paid}\n\nRequesting closure will apply immediately if you can already approve closures, otherwise it will need admin/upper-management approval.`;
}

type IconComponent = typeof Eye;

type ActionKey =
  | "details"
  | "edit"
  | "activity"
  | "notes"
  | "status"
  | "testDrive"
  | "quotation"
  | "documents"
  | "review"
  | "convert"
  | "book"
  | "payment"
  | "revert"
  | "closure"
  | "changeKind"
  | "cancelKind";

interface ActionItem {
  key: ActionKey;
  label: string;
  Icon: IconComponent;
  // Enabled once the matching step is implemented; until then the row is
  // shown (so the structure is visible) but not pressable.
  enabled: boolean;
  info?: string;
}

interface ActionSection {
  title: string;
  items: ActionItem[];
}

function statusBadgeVariant(
  status: string,
): "success" | "error" | "warning" | "info" | "default" {
  const s = status.toLowerCase();
  if (s === "sold" || s === "completed" || s === "booked") return "success";
  if (s === "closed") return "default";
  if (s.includes("pending")) return "warning";
  if (s.includes("rejected")) return "error";
  if (s === "converted to deal") return "info";
  return "default";
}

interface InquiryPermissions {
  isAdmin: boolean;
  canView: boolean;
  canChange: boolean;
}

function buildSections(
  customer: Customer | null,
  perms: InquiryPermissions,
): ActionSection[] {
  if (!customer) return [];

  const status =
    customer.status ??
    (customer.is_converted_to_deal ? "Converted to Deal" : "Open");
  const isClosed = status === "Closed";
  const isConverted = !!customer.is_converted_to_deal;
  const isBooked = !!customer.is_booked;
  const bookingApproval = customer.booking_approval_status ?? null;
  const revertApproval = customer.revert_stage_approval_status ?? null;
  const closureApproval = customer.closure_approval_status ?? null;
  const kindChangeApproval = customer.kind_change_approval_status ?? null;
  const dealAmount =
    customer.deal_amount != null ? Number(customer.deal_amount) : null;
  const totalPaid = customer.total_payments_made ?? 0;

  const records: ActionItem[] = [
    { key: "activity", label: "Activity", Icon: Calendar, enabled: true },
    { key: "notes", label: "Notes", Icon: StickyNote, enabled: true },
    { key: "status", label: "Deal Status", Icon: List, enabled: true },
    { key: "testDrive", label: "Test Drive", Icon: Car, enabled: true },
    { key: "quotation", label: "Quotation", Icon: FileText, enabled: true },
    { key: "documents", label: "Documents", Icon: Folder, enabled: true },
  ];

  const customerItems: ActionItem[] = [
    { key: "details", label: "View Details", Icon: Eye, enabled: true },
  ];
  // Edit needs inquiry change rights (web: isAdmin || can_change_inquiry).
  if (perms.isAdmin || perms.canChange) {
    customerItems.push({
      key: "edit",
      label: "Edit Customer",
      Icon: Pencil,
      enabled: true,
    });
  }

  const sections: ActionSection[] = [
    {
      title: "Customer",
      items: customerItems,
    },
  ];

  if (!isClosed) {
    if (isConverted) {
      const pipeline: ActionItem[] = [];

      if (isBooked) {
        pipeline.push({
          key: "payment",
          label: "Payments",
          Icon: Wallet,
          enabled: false,
        });
      } else if (bookingApproval === "pending") {
        pipeline.push({
          key: "book",
          label: "Booking",
          Icon: Calendar,
          enabled: false,
          info: "Pending approval",
        });
      } else {
        pipeline.push({
          key: "book",
          label: "Perform Booking",
          Icon: Calendar,
          enabled: true,
        });
      }

      if ((perms.isAdmin || perms.canView) && REVERTIBLE_STATUSES.has(status)) {
        pipeline.push({
          key: "revert",
          label: "Revert Stage",
          Icon: Undo2,
          enabled: revertApproval !== "pending",
          info: revertApproval === "pending" ? "Pending approval" : undefined,
        });
      }

      if (
        (perms.isAdmin || perms.canView) &&
        dealAmount != null &&
        totalPaid >= dealAmount
      ) {
        pipeline.push({
          key: "closure",
          label: "Request Closure",
          Icon: Lock,
          enabled: closureApproval !== "pending",
          info: closureApproval === "pending" ? "Pending approval" : undefined,
        });
      }

      if (perms.isAdmin && status !== "Sold") {
        pipeline.push(
          kindChangeApproval === "pending"
            ? {
                key: "cancelKind",
                label: "Cancel Kind Change",
                Icon: Shuffle,
                enabled: true,
                info: "Pending approval",
              }
            : {
                key: "changeKind",
                label: "Change Kind",
                Icon: Shuffle,
                enabled: true,
              },
        );
      }

      sections.push({ title: "Pipeline", items: pipeline });
    } else {
      const pipelineItems: ActionItem[] = [
        {
          key: "review",
          label: "Write Review",
          Icon: MessageSquare,
          enabled: true,
        },
        {
          key: "convert",
          label: "Convert to Deal",
          Icon: Repeat,
          enabled: true,
        },
      ];
      // Kind changes are admin-only (web gates on isAdmin).
      if (perms.isAdmin) {
        pipelineItems.push(
          kindChangeApproval === "pending"
            ? {
                key: "cancelKind",
                label: "Cancel Kind Change",
                Icon: Shuffle,
                enabled: true,
                info: "Pending approval",
              }
            : {
                key: "changeKind",
                label: "Change Kind",
                Icon: Shuffle,
                enabled: true,
              },
        );
      }
      sections.push({
        title: "Pipeline",
        items: pipelineItems,
      });
    }
  }

  // Records (activity/notes/status/test-drive/quotation/documents) mirror the
  // web detail tabs, which are only reachable once the inquiry is a deal.
  if (isConverted) {
    sections.push({ title: "Records", items: records });
  }

  return sections;
}

interface ActionRowProps {
  item: ActionItem;
  onPress: (key: ActionKey) => void;
}

function ActionRow({ item, onPress }: ActionRowProps) {
  const theme = useTheme();
  const color = item.enabled ? theme.color?.val : theme.secondaryText?.val;
  const Icon = item.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!item.enabled}
      onPress={() => onPress(item.key)}
      style={{ opacity: item.enabled ? 1 : 0.4 }}
    >
      <XStack alignItems="center" gap="$3" paddingVertical={14}>
        <Icon size={20} color={color} />
        <YStack flex={1}>
          <Text fontSize="$4" color="$color" fontWeight="500">
            {item.label}
          </Text>
          {item.info ? (
            <Text fontSize="$2" color="$secondaryText">
              {item.info}
            </Text>
          ) : null}
        </YStack>
        {item.enabled ? (
          <ChevronRight size={18} color={theme.secondaryText?.val} />
        ) : null}
      </XStack>
    </TouchableOpacity>
  );
}

type DrawerView =
  | "menu"
  | "details"
  | "edit"
  | "activity"
  | "notes"
  | "status"
  | "testDrive"
  | "quotation"
  | "documents"
  | "addNote"
  | "addActivity"
  | "addStatus"
  | "review"
  | "changeKind"
  | "convert"
  | "book";

const VIEW_BY_ACTION: Partial<Record<ActionKey, DrawerView>> = {
  details: "details",
  edit: "edit",
  activity: "activity",
  notes: "notes",
  status: "status",
  testDrive: "testDrive",
  quotation: "quotation",
  documents: "documents",
  review: "review",
  changeKind: "changeKind",
  convert: "convert",
  book: "book",
};

const VIEW_TITLES: Record<DrawerView, string> = {
  menu: "",
  details: "Customer Details",
  edit: "Edit Customer",
  activity: "Activity",
  notes: "Notes",
  status: "Deal Status",
  testDrive: "Test Drive",
  quotation: "Quotation",
  documents: "Documents",
  addNote: "Add Note",
  addActivity: "Add Activity",
  addStatus: "Add Deal Status",
  review: "Write Review",
  changeKind: "Change Kind",
  convert: "Convert to Deal",
  book: "Perform Booking",
};

// Add-forms are reached from their list view, so their back arrow returns to
// that list instead of the whole menu.
const BACK_TARGET: Partial<Record<DrawerView, DrawerView>> = {
  addNote: "notes",
  addActivity: "activity",
  addStatus: "status",
};

function ResourceView({
  view,
  inquiryId,
  onAdd,
}: {
  view: DrawerView;
  inquiryId: string;
  onAdd: (view: DrawerView) => void;
}) {
  switch (view) {
    case "activity":
      return (
        <ActivityView inquiryId={inquiryId} onAdd={() => onAdd("addActivity")} />
      );
    case "notes":
      return <NotesView inquiryId={inquiryId} onAdd={() => onAdd("addNote")} />;
    case "status":
      return (
        <StatusView inquiryId={inquiryId} onAdd={() => onAdd("addStatus")} />
      );
    case "testDrive":
      return <TestDriveView inquiryId={inquiryId} />;
    case "quotation":
      return <QuotationView inquiryId={inquiryId} />;
    case "documents":
      return <DocumentView inquiryId={inquiryId} />;
    default:
      return null;
  }
}

interface CustomerActionDrawerProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerActionDrawer({
  open,
  onClose,
  customer,
}: CustomerActionDrawerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [view, setView] = useState<DrawerView>("menu");
  // Revert / closure need only a confirmation, so they run from a modal rather
  // than a drawer sub-view.
  const [confirmAction, setConfirmAction] = useState<
    "revert" | "closure" | "cancelKind" | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Always land back on the menu with a clean slate when the drawer is opened
  // for a customer, so a previous customer's sub-lists never flash.
  useEffect(() => {
    if (open) {
      setView("menu");
      setConfirmAction(null);
      dispatch(clearCustomerResources());
    }
  }, [open, customer?.id, dispatch]);

  const profile = useAppSelector((state) => state.crmProfile.profile);
  // No permission matrix in the profile (or an older payload) → fail open and
  // let the server enforce, rather than hiding every gated action.
  const perms = useMemo<InquiryPermissions>(() => {
    const isAdmin = !!(
      profile?.is_superuser || profile?.authorities?.includes("SUPERUSER")
    );
    const map = buildPermissionMap(profile?.permissions);
    const can = (module: string, action: string) =>
      !profile?.permissions
        ? true
        : canPerformAction(map, isAdmin, module, action);
    return {
      isAdmin,
      canView: can("inquiry", "view"),
      canChange: can("inquiry", "change"),
    };
  }, [profile]);

  const sections = useMemo(
    () => buildSections(customer, perms),
    [customer, perms],
  );

  const status =
    customer?.status ??
    (customer?.is_converted_to_deal ? "Converted to Deal" : "Open");

  const handleAction = (key: ActionKey) => {
    if (key === "revert" || key === "closure" || key === "cancelKind") {
      setConfirmAction(key);
      return;
    }
    const next = VIEW_BY_ACTION[key];
    if (next) setView(next);
  };

  const runConfirmAction = async () => {
    if (!customer || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "cancelKind") {
        await dispatch(
          cancelInquiryKindChange({ inquiryId: customer.id }),
        ).unwrap();
        toast.success("Kind change request cancelled");
        setConfirmAction(null);
        onClose();
        return;
      }
      if (confirmAction === "revert") {
        const result = await dispatch(
          revertInquiryStage({ inquiryId: String(customer.id) }),
        ).unwrap();
        toast.success(
          result?.data?.revert_stage_approval_status === "pending"
            ? "Stage revert submitted, pending approval."
            : "Inquiry stage reverted",
        );
      } else {
        const result = await dispatch(
          requestInquiryClosure({ inquiryId: String(customer.id) }),
        ).unwrap();
        toast.success(
          result?.data?.closure_approval_status === "pending"
            ? "Closure request submitted, pending approval."
            : "Inquiry closed",
        );
      }
      setConfirmAction(null);
      onClose();
    } catch (error) {
      toast.error(
        typeof error === "string" && error ? error : "Action failed",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const headerTitle =
    view === "menu" ? customer?.name ?? "Customer" : VIEW_TITLES[view];

  return (
    <BottomDrawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      headerTitle={headerTitle}
      headerLeftContent={
        view !== "menu" ? (
          <TouchableOpacity
            onPress={() => setView(BACK_TARGET[view] ?? "menu")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color={theme.color?.val} />
          </TouchableOpacity>
        ) : undefined
      }
      height={80}
    >
      {view === "menu" || !customer ? (
        <YStack>
          {customer && (
            <YStack
              gap="$2"
              paddingBottom="$3"
              marginBottom="$2"
              borderBottomWidth={1}
              borderBottomColor="$outline"
            >
              <Text fontSize="$3" color="$secondaryText">
                {customer.inq_no ? `Inquiry ${customer.inq_no}` : "Inquiry"}
              </Text>
              <XStack gap="$2" alignItems="center" flexWrap="wrap">
                {customer.kind_name ? (
                  <Badge label={customer.kind_name} size="sm" variant="info" />
                ) : null}
                <Badge
                  label={status}
                  size="sm"
                  variant={statusBadgeVariant(status)}
                />
              </XStack>
            </YStack>
          )}

          {sections.map((section) => (
            <YStack key={section.title} marginBottom="$2">
              <Text
                fontSize="$2"
                fontWeight="700"
                color="$secondaryText"
                textTransform="uppercase"
                marginBottom="$1"
              >
                {section.title}
              </Text>
              {section.items.map((item) => (
                <ActionRow key={item.key} item={item} onPress={handleAction} />
              ))}
            </YStack>
          ))}
        </YStack>
      ) : view === "details" ? (
        <CustomerDetailContent id={String(customer.id)} />
      ) : view === "addNote" ? (
        <AddNoteForm
          inquiryId={String(customer.id)}
          onDone={() => setView("notes")}
        />
      ) : view === "addActivity" ? (
        <AddActivityForm
          inquiryId={String(customer.id)}
          onDone={() => setView("activity")}
        />
      ) : view === "addStatus" ? (
        <AddDealStatusForm
          inquiryId={String(customer.id)}
          onDone={() => setView("status")}
        />
      ) : view === "review" ? (
        <ReviewForm inquiryId={String(customer.id)} customer={customer} />
      ) : view === "changeKind" ? (
        <ChangeKindForm
          inquiryId={String(customer.id)}
          customer={customer}
          onDone={onClose}
        />
      ) : view === "edit" ? (
        <EditCustomerForm
          inquiryId={String(customer.id)}
          customer={customer}
          onDone={onClose}
        />
      ) : view === "convert" ? (
        <ConvertToDealForm
          inquiryId={String(customer.id)}
          vehicleDetail={customer.vehicle_details?.[0]}
          onDone={onClose}
        />
      ) : view === "book" ? (
        <BookForm inquiryId={String(customer.id)} onDone={onClose} />
      ) : (
        <ResourceView
          view={view}
          inquiryId={String(customer.id)}
          onAdd={setView}
        />
      )}

      <GenericModal
        isOpen={confirmAction !== null}
        variant="confirmCancel"
        title={
          confirmAction === "revert"
            ? `Revert to ${previousStageName(status)}`
            : confirmAction === "cancelKind"
              ? "Cancel Kind Change"
              : "Request Inquiry Closure"
        }
        description={confirmDescription(customer, confirmAction, status)}
        confirmText={
          confirmAction === "revert"
            ? "Revert"
            : confirmAction === "cancelKind"
              ? "Cancel Request"
              : "Request Close"
        }
        loading={confirmLoading}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmAction}
      />
    </BottomDrawer>
  );
}
