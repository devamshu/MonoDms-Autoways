import { Text } from "tamagui";
import { Column } from "../../../components/custom/table/types";

export const getOrdersColumns = (onPress: (id: string) => void): Column[] => [
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
    id: "order_no",
    label: "Order No",
    accessor: "order_no",
    sortable: true,
    width: 160,
    render: (value: any, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => onPress(String(row.id))}
      >
        {value || "—"}
      </Text>
    ),
  },

  {
    id: "order_date",
    label: "Dispatch Date",
    accessor: "order_date",
    sortable: true,
    width: 110,
    render: (value: string) => (
      <Text numberOfLines={1}>
        {value ? new Date(value).toLocaleDateString() : "—"}
      </Text>
    ),
  },
  {
    id: "stockyard",
    label: "Dealer",
    accessor: "stockyard",
    sortable: true,
    width: 100,
    align: "center",
  },
];
