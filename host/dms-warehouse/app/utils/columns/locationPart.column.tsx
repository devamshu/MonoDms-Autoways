import { Text } from "tamagui";
import { Column } from "../../../components/custom/table/types";

export const getLocationPartsColumns = (): Column[] => [
  {
    id: "sno",
    label: "S.No",
    accessor: "sno",
    width: 70,
    align: "center",
    render: (_value: string, _row: any, index?: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {index !== undefined ? index + 1 : "—"}
      </Text>
    ),
  },
  {
    id: "partCode",
    label: "Part Code",
    accessor: "partCode",
    width: 150,
    render: (value: string) => <Text fontWeight="500">{value}</Text>,
  },
  {
    id: "name",
    label: "Name",
    accessor: "name",
    width: 150,
    render: (value: string) => <Text numberOfLines={1}>{value ?? "—"}</Text>,
  },
  {
    id: "quantity",
    label: "Quantity",
    accessor: "quantity",
    width: 100,
    align: "center",
    render: (value: number) => <Text>{value}</Text>,
  },
];
