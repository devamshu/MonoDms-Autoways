import { Text } from "tamagui";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { Column } from "../../../components/custom/table/types";

export const getVehicleStockColumns = (
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
    id: "vehicle",
    label: "Vehicle",
    accessor: "vehicle",
    sortable: false,
    width: 160,
    render: (value: any, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => onPress(String(row.id))}
      >
        {formatValue(value?.name)}
      </Text>
    ),
  },
  {
    id: "chassis_no",
    label: "Chassis No",
    accessor: "chassis_no",
    sortable: true,
    width: 160,
    render: (value: string) => (
      <Text numberOfLines={1} fontSize="$xs" fontFamily="$mono">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "variant",
    label: "Variant",
    accessor: "variant",
    sortable: false,
    width: 160,
    render: (value: any) => (
      <Text numberOfLines={1}>{formatValue(value?.name)}</Text>
    ),
  },
  {
    id: "color",
    label: "Color",
    accessor: "color",
    sortable: false,
    width: 160,
    render: (value: any) => (
      <Text numberOfLines={1}>{formatValue(value?.name)}</Text>
    ),
  },
  {
    id: "manufacturing_year",
    label: "Year",
    accessor: "manufacturing_year",
    sortable: true,
    width: 120,
    align: "center",
    render: (value: string) => (
      <Text numberOfLines={1}>{formatValue(value)}</Text>
    ),
  },
  {
    id: "engine_no",
    label: "Engine No",
    accessor: "engine_no",
    sortable: true,
    width: 160,
    render: (value: string) => (
      <Text numberOfLines={1} fontSize="$xs" fontFamily="$mono">
        {formatValue(value)}
      </Text>
    ),
  },
  {
    id: "vehicle_type",
    label: "Type",
    accessor: "vehicle_type",
    sortable: true,
    width: 100,
    align: "center",
    render: (value: string) => (
      <Text numberOfLines={1}>{formatValue(value)}</Text>
    ),
  },
  {
    id: "status_display",
    label: "Status",
    accessor: "status_display",
    sortable: true,
    width: 120,
    align: "center",
    render: (value: string) => (
      <Text numberOfLines={1}>{formatValue(value)}</Text>
    ),
  },
];
