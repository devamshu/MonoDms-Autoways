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
    accessor: "dispatch",
    sortable: false,
    width: 160,
    render: (_value: any, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => onPress(String(row.id))}
      >
        {formatValue(row.dispatch?.dms_vehicle?.vehicle?.name)}
      </Text>
    ),
  },
  {
    id: "chassis_no",
    label: "Chassis No",
    accessor: "dispatch",
    sortable: true,
    width: 160,
    sortKey: "dispatch__chassis_no",
    render: (_value: any, row: any) => (
      <Text numberOfLines={1} fontSize="$xs" fontFamily="$mono">
        {formatValue(row.dispatch?.chassis_no)}
      </Text>
    ),
  },
  {
    id: "variant",
    label: "Variant",
    accessor: "dispatch",
    sortable: false,
    width: 160,
    render: (_value: any, row: any) => (
      <Text numberOfLines={1}>
        {formatValue(row.dispatch?.dms_vehicle?.variant?.name)}
      </Text>
    ),
  },
  {
    id: "color",
    label: "Color",
    accessor: "dispatch",
    sortable: false,
    width: 160,
    render: (_value: any, row: any) => (
      <Text numberOfLines={1}>
        {formatValue(row.dispatch?.dms_vehicle?.color?.name)}
      </Text>
    ),
  },
  {
    id: "manufacturing_year",
    label: "Year",
    accessor: "dispatch",
    sortable: false,
    width: 120,
    align: "center",
    render: (_value: any, row: any) => (
      <Text numberOfLines={1}>
        {formatValue(row.dispatch?.dms_vehicle?.manufacturing_year)}
      </Text>
    ),
  },
  {
    id: "engine_no",
    label: "Engine No",
    accessor: "dispatch",
    sortable: true,
    width: 160,
    sortKey: "dispatch__engine_no",
    render: (_value: any, row: any) => (
      <Text numberOfLines={1} fontSize="$xs" fontFamily="$mono">
        {formatValue(row.dispatch?.engine_no)}
      </Text>
    ),
  },
  {
    id: "vehicle_type",
    label: "Type",
    accessor: "dispatch",
    sortable: false,
    width: 100,
    align: "center",
    render: (_value: any, row: any) => (
      <Text numberOfLines={1}>{formatValue(row.dispatch?.type)}</Text>
    ),
  },
  {
    id: "current_status",
    label: "Status",
    accessor: "current_status",
    sortable: true,
    width: 120,
    align: "center",
    render: (value: string) => (
      <Text numberOfLines={1}>{formatValue(value)}</Text>
    ),
  },
];
