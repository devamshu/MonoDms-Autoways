import { Text } from "tamagui";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Column } from "../table/types";

// Shape of `settings.table_columns` on the customers-list response.
export interface CcdServerColumn {
  field: string;
  header: string;
  sortable: boolean;
  type?: string;
}

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : null;

const textCell = (value: any) => (
  <Text numberOfLines={1} color="$color">
    {formatValue(value)}
  </Text>
);

const snColumn: Column = {
  id: "sn",
  label: "SN",
  accessor: "sn",
  width: 60,
  align: "center",
  render: (value: number) => (
    <Text fontWeight="500" numberOfLines={1} color="$color">
      {formatValue(value)}
    </Text>
  ),
};

// The CCD tables render fields the API does not send directly (row numbers,
// pre-formatted dates, flattened contact details), so every consumer has to run
// its rows through the matching transform before handing them to the columns.
export const transformInquiryRows = (rows: any[]) =>
  (rows ?? []).map((item, index) => ({
    ...item,
    sn: index + 1,
    formatted_created_date: fmtDate(item.created_date),
  }));

export const transformRetailRows = (rows: any[]) =>
  (rows ?? []).map((item, index) => ({
    ...item,
    sn: index + 1,
    id: item.sales_id ?? item.id,
    customer_name:
      item.customer?.full_name ??
      item.customer_name ??
      item.phone?.[0]?.full_name ??
      null,
    phone_number: item.phone?.[0]?.phone ?? null,
    email_address: item.email?.[0]?.email ?? null,
    formatted_created_date: fmtDate(item.created_date),
  }));

export const transformPsfRows = (rows: any[]) =>
  (rows ?? []).map((item, index) => ({
    ...item,
    sn: index + 1,
    customer_name: item.party_name?.full_name ?? item.customer_name ?? null,
    formatted_closed_date: fmtDate(item.closed_date),
  }));

export const getCcdInquiryColumns = (
  onPress: (id: string) => void,
): Column[] => [
  snColumn,
  {
    id: "inq_no",
    label: "Inquiry No",
    accessor: "inq_no",
    width: 120,
    sortable: true,
    render: (value: string | null, row: any) => (
      <Text
        numberOfLines={1}
        color="$primary"
        fontWeight="500"
        onPress={(e) => {
          e.stopPropagation(); 
          onPress(row.id.toString());
        }}
      >
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "name",
    label: "Customer Name",
    accessor: "name",
    width: 180,
    sortable: true,
    render: textCell,
  },
  {
    id: "contact",
    label: "Contact",
    accessor: "contact",
    width: 140,
    sortable: true,
    render: textCell,
  },
  {
    id: "inquiry_source_name",
    label: "Source",
    accessor: "inquiry_source_name",
    width: 140,
    sortable: true,
    render: textCell,
  },
  {
    id: "dealer_name",
    label: "Dealer",
    accessor: "dealer_name",
    width: 160,
    sortable: true,
    render: textCell,
  },
  {
    id: "formatted_created_date",
    label: "Created Date",
    accessor: "formatted_created_date",
    // Display value is built client-side; sort on the real backend field.
    sortKey: "created_date",
    width: 140,
    sortable: true,
    render: textCell,
  },
];

export const getCcdRetailColumns = (
  onPress: (id: string) => void,
): Column[] => [
  snColumn,
  {
    id: "sales_id",
    label: "Sales ID",
    accessor: "sales_id",
    width: 100,
    sortable: true,
    render: (value: number | null, row: any) => (
      <Text
        numberOfLines={1}
        color="$primary"
        fontWeight="500"
        onPress={(e) => {
          e.stopPropagation();
          onPress((row.sales_id ?? row.id).toString());
        }}
      >
        {formatValue(value)}
      </Text>
    ),
  },
  // Customer / Phone / Email are flattened out of nested objects by
  // transformRetailRows, so their column ids are display-only. Order on the
  // serializer field the row actually carries.
  {
    id: "customer_name",
    label: "Customer",
    accessor: "customer_name",
    sortKey: "customer",
    width: 180,
    sortable: true,
    render: textCell,
  },
  {
    id: "phone_number",
    label: "Phone",
    accessor: "phone_number",
    sortKey: "phone",
    width: 140,
    sortable: true,
    render: textCell,
  },
  {
    id: "email_address",
    label: "Email",
    accessor: "email_address",
    sortKey: "email",
    width: 180,
    sortable: true,
    render: textCell,
  },
  {
    id: "formatted_created_date",
    label: "Created Date",
    accessor: "formatted_created_date",
    // Display value is built client-side; sort on the real backend field.
    sortKey: "created_date",
    width: 140,
    sortable: true,
    render: textCell,
  },
];

export const getCcdPsfColumns = (onPress: (id: string) => void): Column[] => [
  snColumn,
  {
    id: "card_no",
    label: "Card No",
    accessor: "card_no",
    width: 150,
    sortable: true,
    render: (value: string | null, row: any) => (
      <Text
        numberOfLines={1}
        color="$primary"
        fontWeight="500"
        onPress={(e) => {
          e.stopPropagation();
          onPress(row.id.toString());
        }}
      >
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "vehicle_no",
    label: "Vehicle No",
    accessor: "vehicle_no",
    width: 150,
    sortable: true,
    render: textCell,
  },
  {
    id: "customer_name",
    label: "Customer",
    accessor: "customer_name",
    width: 200,
    // Not sortable: transformPsfRows builds this from `party_name.full_name`,
    // so there is no field to put in `ordering` — it was sending
    // `ordering=customer_name`, which the API ignores. An arrow that cannot
    // reorder anything is worse than no arrow, so the affordance is off until
    // the real key is known. `applyServerColumnMeta` turns it back on
    // automatically if the module declares a matching field.
    sortable: false,
    render: textCell,
  },
  {
    id: "formatted_closed_date",
    label: "Closed Date",
    accessor: "formatted_closed_date",
    // Display value is built client-side; sort on the real backend field.
    sortKey: "closed_date",
    width: 140,
    sortable: true,
    render: textCell,
  },
];

// ─── Server metadata ──────────────────────────────────────────────────────────

// The curated columns above decide how a row *looks*; `settings.table_columns`
// tells us what the server can order on. This merge only ever *enables* — it
// never strips a sort the curated column declared for itself.
//
// It used to disable anything the server did not list, which silently killed
// working sorts (Sales ID among them) whenever a module's table_columns covered
// a different set of fields than the curated columns render. A column is
// therefore sortable if either side says so, and when the server does know the
// field its name wins as the `ordering` value.
export const applyServerColumnMeta = (
  columns: Column[],
  tableColumns?: CcdServerColumn[],
): Column[] => {
  if (!tableColumns || tableColumns.length === 0) return columns;

  return columns.map((col) => {
    const field = col.sortKey ?? col.id;
    const serverColumn = tableColumns.find((tc) => tc.field === field);

    if (!serverColumn) return col;

    return {
      ...col,
      sortable: serverColumn.sortable || !!col.sortable,
      sortKey: serverColumn.field,
    };
  });
};

// `metadata.search_fields` lists the backend fields `search` spans; turn them
// into the human labels the server already supplies for those same fields.
export const buildSearchPlaceholder = (
  searchFields?: string[],
  tableColumns?: CcdServerColumn[],
): string => {
  if (!searchFields || searchFields.length === 0) return "Search...";

  const labels = searchFields.map(
    (field) =>
      tableColumns?.find((tc) => tc.field === field)?.header ??
      // Fall back to a readable form of the raw field: `inquiry_source_name`
      // spans a relation as `customer__full_name`, so keep only the last part.
      field
        .split("__")
        .pop()!
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
  );

  return `Search by ${labels.join(", ")}...`;
};
