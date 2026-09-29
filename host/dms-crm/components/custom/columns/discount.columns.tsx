import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Column } from "../../../components/custom/table/types";
import { Text } from "tamagui";

export const getDiscountColumns = (onPress: (id: string) => void): Column[] => [
  {
    id: "sn",
    label: "SN",
    accessor: "id",
    sortable: false,
    width: 60,
    align: "center",
    render: (_value: any, _row: any, index?: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {(index ?? 0) + 1}
      </Text>
    ),
  },
  {
    id: "inquiry_no",
    label: "Inquiry No.",
    accessor: "inquiry_no",
    sortable: true,
    width: 120,
    render: (value: string | null, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => {
          onPress(String(row.id));
        }}
      >
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "inquiry_name",
    label: "Inquiry Name",
    accessor: "inquiry_name",
    sortable: true,
    width: 140,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "assigned_to_name",
    label: "Assigned To",
    accessor: "assigned_to_name",
    sortable: false,
    width: 130,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "requested_discount_amount",
    label: "Discount Request",
    accessor: "requested_discount_amount",
    sortable: true,
    width: 140,
    render: (value: number | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "given_discount_amount",
    label: "Given Amount",
    accessor: "given_discount_amount",
    sortable: true,
    width: 120,
    render: (value: number | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "vehicle_name",
    label: "Vehicle",
    accessor: "vehicle_name",
    sortable: false,
    width: 100,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "policy_name",
    label: "Policy",
    accessor: "policy_name",
    sortable: false,
    width: 100,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "status",
    label: "Status",
    accessor: "status_display",
    sortable: true,
    width: 100,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "requested_by_name",
    label: "Requested By",
    accessor: "requested_by_name",
    sortable: false,
    width: 130,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "remarks",
    label: "Remarks",
    accessor: "remarks",
    sortable: false,
    width: 160,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {formatValue(value)}
      </Text>
    ),
  },
];
