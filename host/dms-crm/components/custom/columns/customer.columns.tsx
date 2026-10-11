import { Column } from "@/components/custom/table/types";
import { Text } from "tamagui";
import { formatNpr } from "../../../app/utils/format/format";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";

const safeFormat = (value: any): string => {
  if (value === null || value === undefined) return "—";
  return formatValue(value);
};

const safeToString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const textCell = (value: any) => (
  <Text numberOfLines={1} color="$color">
    {formatValue(value)}
  </Text>
);

const moneyCell = (value: any) => (
  <Text numberOfLines={1} color="$color" textAlign="right">
    {formatNpr(value)}
  </Text>
);

const dateCell = (value: any) => {
  if (!value) return <Text numberOfLines={1}>—</Text>;
  const date = new Date(value);
  if (isNaN(date.getTime())) return <Text numberOfLines={1}>—</Text>;
  return (
    <Text numberOfLines={1} color="$color">
      {date.toLocaleDateString()}
    </Text>
  );
};

// Web Customer page prefers `contact` when it is purely numeric, otherwise the
// first phone (mobile category first) — mirrored here.
const primaryPhone = (phone: any): string => {
  if (!Array.isArray(phone) || phone.length === 0) return "";
  const chosen = phone.find((p) => p?.category === "mobile") || phone[0];
  return `${chosen?.country_code?.trim() || ""} ${chosen?.phone?.trim() || ""}`.trim();
};

const contactLabel = (row: any): string =>
  row?.contact && /^\d+$/.test(row.contact) ? row.contact : primaryPhone(row?.phone);

// Booked deals carry `deal_vehicle_details`; unconverted inquiries only have the
// requested `vehicle_details`, so fall back to the first of those.
const vehicleLabel = (row: any): string => {
  const vehicle = row?.deal_vehicle_details ?? row?.vehicle_details?.[0];
  if (!vehicle) return "";
  return [
    vehicle.vehicle_name,
    vehicle.variant_name,
    vehicle.color_name,
    vehicle.manufacturing_year,
  ]
    .filter(Boolean)
    .join(" ");
};

// Columns mirror the fields on GET /crm/inquiry/ (`Customer`), matching the web
// Inquiry/Customer tables while adding the amount columns the web Customers page
// shows. Amounts are rendered in NPR via `formatNpr`.
export const getCustomerColumns = (onPress: (id: string) => void): Column[] => [
  {
    id: "sn",
    label: "SN",
    accessor: "id",
    width: 60,
    align: "center",
    render: (_value: any, _row: any, index?: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {index != null ? index + 1 : "—"}
      </Text>
    ),
  },
  {
    id: "inq_no",
    label: "Inquiry No",
    accessor: "inq_no",
    sortable: true,
    width: 110,
    render: (value: any) => (
      <Text numberOfLines={1} color="$color">
        {safeFormat(value)}
      </Text>
    ),
  },
  {
    id: "name",
    label: "Name",
    accessor: "name",
    sortable: true,
    width: 160,
    render: (value: any, row: any) => {
      const safeId = row?.id ? safeToString(row.id) : "";
      const safeName = safeFormat(value);

      return (
        <Text
          color="$primary"
          fontWeight="500"
          numberOfLines={1}
          onPress={() => {
            if (safeId) {
              onPress(safeId);
            } else {
              console.warn("Cannot navigate - invalid row id:", row);
            }
          }}
        >
          {safeName}
        </Text>
      );
    },
  },
  {
    id: "contact",
    label: "Contact",
    accessor: "contact",
    sortable: true,
    width: 140,
    render: (_value: any, row: any) => textCell(contactLabel(row)),
  },
  {
    id: "contact_person",
    label: "Contact Person",
    accessor: "contact_person",
    sortable: true,
    width: 150,
    render: textCell,
  },
  {
    id: "email_address",
    label: "Email",
    accessor: "email",
    width: 180,
    render: (_value: any, row: any) => textCell(row?.email?.[0]?.email),
  },
  {
    id: "inquiry_date",
    label: "Inquiry Date",
    accessor: "inquiry_date",
    sortable: true,
    width: 120,
    render: dateCell,
  },
  {
    id: "inquiry_age",
    label: "Inquiry Age",
    accessor: "inquiry_age",
    sortable: true,
    width: 100,
    render: (value: any) => (
      <Text numberOfLines={1} color="$color">
        {safeFormat(value)}
      </Text>
    ),
  },
  {
    id: "kind_name",
    label: "Kind",
    accessor: "kind_name",
    sortable: true,
    width: 100,
    render: (value: any) => <Text numberOfLines={1}>{safeFormat(value)}</Text>,
  },
  {
    id: "inquiry_source_name",
    label: "Source",
    accessor: "inquiry_source_name",
    sortable: true,
    width: 140,
    render: textCell,
  },
  {
    id: "dealer_name",
    label: "Dealer",
    accessor: "dealer_name",
    // Display value comes from the serializer; sort on the real FK.
    sortKey: "dealer",
    sortable: true,
    width: 160,
    render: textCell,
  },
  {
    id: "vehicle",
    label: "Vehicle",
    accessor: "deal_vehicle_details",
    // Built client-side from deal/requested vehicle details; no field to order.
    width: 200,
    render: (_value: any, row: any) => textCell(vehicleLabel(row)),
  },
  {
    id: "deal_amount",
    label: "Deal Amount",
    accessor: "deal_amount",
    sortable: true,
    align: "right",
    width: 140,
    render: moneyCell,
  },
  {
    id: "booking_amount",
    label: "Booking Amount",
    accessor: "booking_amount",
    sortable: true,
    width: 150,
    align: "right",
    render: moneyCell,
  },
  {
    id: "total_payments_made",
    label: "Total Paid",
    accessor: "total_payments_made",
    sortable: true,
    width: 140,
    align: "right",
    render: moneyCell,
  },
  {
    id: "booking_approved_at",
    label: "Booked On",
    accessor: "booking_approved_at",
    sortable: true,
    width: 120,
    render: dateCell,
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
    sortable: true,
    width: 110,
    render: (value: any) => <Text numberOfLines={1}>{safeFormat(value)}</Text>,
  },
  {
    id: "assigned_to_name",
    label: "Assigned To",
    accessor: "assigned_to_name",
    // Display name is derived from the FK; order on the FK itself.
    sortKey: "assigned_to",
    sortable: true,
    width: 150,
    render: textCell,
  },
  {
    id: "is_converted_to_deal",
    label: "Converted",
    accessor: "is_converted_to_deal",
    sortable: true,
    width: 100,
    render: (value: any) => {
      const isConverted = value === true || value === "true" || value === 1;
      return <Text numberOfLines={1}>{isConverted ? "Yes" : "No"}</Text>;
    },
  },
];
