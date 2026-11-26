import { Text } from "tamagui";
import { Badge } from "../../../components/custom/badge";
import { Column } from "../../../components/custom/table/types";
import { Followup } from "../../features/ccd/types";
import {
  dash,
  describeDue,
  KIND_VARIANT,
  remarksFor,
  rescheduleNote,
  STATUS_BADGE,
} from "./followup-shared";
import { formatFullDateTime } from "./followup.utils";

// One column, one fact, one line. Anything that used to be stacked in a cell
// (a customer's contact, a due date's "overdue" note, a vehicle's colour and
// year) is its own column, so every cell reads as a single value. The row
// itself is the entry point (it opens the detail panel with Log / Reschedule),
// so there is no Action column.

const text = (value: string | null | undefined) => (
  <Text fontSize="$3" color="$color" numberOfLines={1}>
    {dash(value)}
  </Text>
);

// A row can carry several vehicles; each vehicle attribute is still one
// column, listing that attribute for every vehicle.
const joinVehicles = (
  row: Followup,
  pick: (v: Followup["vehicle_details"][number]) => string | null,
) => {
  const values = (row.vehicle_details ?? [])
    .map(pick)
    .filter((v): v is string => !!v && !!v.trim());
  return values.length ? values.join(", ") : null;
};

export const getFollowupColumns = (): Column[] => [
  {
    id: "sn",
    label: "SN",
    accessor: "sn",
    width: 60,
    align: "center",
    render: (value: number) => (
      <Text fontSize="$3" fontWeight="500" color="$color" numberOfLines={1}>
        {value}
      </Text>
    ),
  },
  {
    id: "inquiry_name",
    label: "Customer",
    accessor: "inquiry_name",
    width: 170,
    render: (_value, row: Followup) => (
      <Text fontSize="$3" fontWeight="600" color="$primary" numberOfLines={1}>
        {row.inquiry_name || `Inquiry #${row.inquiry}`}
      </Text>
    ),
  },
  {
    id: "inquiry_contact",
    label: "Contact",
    accessor: "inquiry_contact",
    width: 130,
    render: text,
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
    width: 110,
    render: (value: Followup["status"]) => (
      <Badge
        label={STATUS_BADGE[value].label}
        variant={STATUS_BADGE[value].variant}
      />
    ),
  },
  {
    id: "due_date",
    label: "Due",
    accessor: "due_date",
    width: 180,
    render: (_value, row: Followup) => {
      if (!row.due_date) return text(null);
      const overdue = row.status === "pending" && row.is_overdue;
      return (
        <Text
          fontSize="$3"
          color={overdue ? "$error" : "$color"}
          fontWeight={overdue ? "700" : "400"}
          numberOfLines={1}
        >
          {formatFullDateTime(row.due_date)}
        </Text>
      );
    },
  },
  {
    id: "timing",
    label: "Timing",
    accessor: "due_date",
    width: 190,
    render: (_value, row: Followup) => {
      const due = describeDue(row, false);
      return (
        <Text
          fontSize="$3"
          color={due.tone === "error" ? "$error" : "$secondaryText"}
          numberOfLines={1}
        >
          {due.text || "—"}
        </Text>
      );
    },
  },
  {
    id: "contact_type",
    label: "Type",
    accessor: "contact_type",
    width: 120,
    render: text,
  },
  {
    id: "inquiry_kind_name",
    label: "Kind",
    accessor: "inquiry_kind_name",
    width: 90,
    render: (value: string | null) =>
      value ? (
        <Badge label={value} variant={KIND_VARIANT[value] ?? "default"} />
      ) : (
        text(null)
      ),
  },
  {
    id: "vehicle",
    label: "Vehicle",
    accessor: "vehicle_details",
    width: 170,
    render: (_value, row: Followup) =>
      text(
        joinVehicles(row, (v) =>
          [v.vehicle_name, v.variant_name].filter(Boolean).join(" "),
        ),
      ),
  },
  {
    id: "color",
    label: "Color",
    accessor: "vehicle_details",
    width: 110,
    render: (_value, row: Followup) => text(joinVehicles(row, (v) => v.color_name)),
  },
  {
    id: "year",
    label: "Year",
    accessor: "vehicle_details",
    width: 80,
    render: (_value, row: Followup) =>
      text(joinVehicles(row, (v) => v.manufacturing_year)),
  },
  {
    id: "deal",
    label: "Deal Vehicle",
    accessor: "is_deal_vehicle",
    width: 110,
    render: (value: boolean) =>
      value ? <Badge label="Deal" variant="success" /> : text(null),
  },
  {
    id: "executive_name",
    label: "Executive",
    accessor: "executive_name",
    width: 150,
    render: text,
  },
  {
    id: "rescheduled",
    label: "Rescheduled",
    accessor: "reschedule_info",
    width: 190,
    render: (_value, row: Followup) => text(rescheduleNote(row)),
  },
  {
    id: "remarks",
    label: "Remarks",
    accessor: "followup_details",
    width: 240,
    // A cancelled row's text is its cancellation reason; the Status column
    // already says it was cancelled, so nothing extra is stacked under it.
    render: (_value, row: Followup) => text(remarksFor(row)),
  },
];
