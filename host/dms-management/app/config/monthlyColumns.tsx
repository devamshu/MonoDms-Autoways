// host/dms-management/config/monthlyColumns.tsx
import { Column } from "@/components/custom/table/types";
import { Text } from "tamagui";

export const monthlyColumns: Column[] = [
  {
    id: "month",
    label: "Month",
    accessor: "month",
    sortable: true,
    width: 100,
  },
  {
    id: "leads",
    label: "Leads",
    accessor: "leads",
    sortable: true,
    width: 90,
    align: "center",
  },
  {
    id: "deals",
    label: "Deals",
    accessor: "deals",
    sortable: true,
    width: 90,
    align: "center",
  },
  {
    id: "conversion_rate",
    label: "Conversion %",
    accessor: "conversion_rate",
    sortable: true,
    width: 120,
    align: "center",
    render: (value: number) => (
      <Text numberOfLines={1} color="$color">
        {value}%
      </Text>
    ),
  },
];
