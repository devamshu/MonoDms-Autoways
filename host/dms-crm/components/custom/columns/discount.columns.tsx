import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";
import { Column } from "../../../components/custom/table/types";
import { Text } from "tamagui";

export const getDiscountColumns = (onPress: (id: string) => void): Column[] => [
  {
    id: "id",
    label: "SN",
    accessor: "id",
    sortable: true,
    width: 60,
    align: "center",
    render: (value: string) => (
      <Text fontWeight="500" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "inquiry",
    label: "Inquiry No.",
    accessor: "inquiry",
    sortable: true,
    width: 100,
    render: (value: number | null, row: any) => (
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
    id: "is_approved",
    label: "Status",
    accessor: "is_approved",
    sortable: true,
    width: 90,
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
