import { Text } from "tamagui";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { Column } from "../../../components/custom/table/types";

export const getOrderPartsColumns = (
  onPress: (id: string) => void,
): Column[] => [
  {
    id: "id",
    label: "SN",
    accessor: "id",
    sortable: false,
    width: 60,
    align: "center",
    render: (_value: string, _row: any, index?: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {index !== undefined ? index + 1 : "—"}
      </Text>
    ),
  },
  {
    id: "part_code",
    label: "Part Code",
    accessor: "sparepart_details",
    sortable: true,
    width: 150,
    render: (value: any, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => onPress(String(row.id))}
      >
        {formatValue(value?.part_code)}
      </Text>
    ),
  },
  {
    id: "part_name",
    label: "Part Name",
    accessor: "sparepart_details",
    sortable: true,
    width: 150,
    render: (value: any) => (
      <Text numberOfLines={1}>{formatValue(value?.name)}</Text>
    ),
  },
  {
    id: "ordered_quantity",
    label: "Ordered Qty",
    accessor: "ordered_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "received_quantity",
    label: "Received Qty",
    accessor: "received_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text numberOfLines={1}>{formatValue(value)}</Text>
    ),
  },
  {
    id: "short_quantity",
    label: "Short Qty",
    accessor: "short_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text color="$red10" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "excess_quantity",
    label: "Excess Qty",
    accessor: "excess_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text color="$orange10" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "damage_quantity",
    label: "Damage Qty",
    accessor: "damage_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text color="$red10" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "backlog_quantity",
    label: "Backlog Qty",
    accessor: "backlog_quantity",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text color="$yellow10" numberOfLines={1}>
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "rate",
    label: "Rate",
    accessor: "rate",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text numberOfLines={1}>{value ? formatValue(value) : "-"}</Text>
    ),
  },
  {
    id: "amount",
    label: "Amount",
    accessor: "amount",
    sortable: true,
    width: 150,
    align: "right",
    render: (value: number) => (
      <Text fontWeight="600" numberOfLines={1}>
        {value ? formatValue(value) : "-"}
      </Text>
    ),
  },
  {
    id: "cancel_status",
    label: "Status",
    accessor: "cancel_status",
    sortable: true,
    width: 150,
    align: "center",
    render: (value: number) => (
      <Text
        color={value === 1 ? "$red10" : "$green10"}
        fontWeight="500"
        numberOfLines={1}
      >
        {value === 1 ? "Cancelled" : "Active"}
      </Text>
    ),
  },
];
