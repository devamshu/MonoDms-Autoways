import { Text } from "tamagui";
import { Column } from "../../../components/custom/table/types";
import { formatValue } from "../../utils/validator/emptyFiledValidaotr";

export const getPartsColumns = (onPress: (id: string) => void): Column[] => [
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
    accessor: "sparepart",
    sortable: true,
    width: 160,
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
    id: "name",
    label: "Part Name",
    accessor: "sparepart",
    sortable: true,
    width: 160,
    render: (value: any) => (
      <Text numberOfLines={1}>{formatValue(value?.name)}</Text>
    ),
  },
  {
    id: "quantity",
    label: "Quantity",
    accessor: "quantity",
    sortable: true,
    width: 160,
    align: "center",
    render: (value: number) => {
      let color = "$color";
      if (value === 0) color = "$red10";
      else if (value < 10) color = "$orange10";
      else color = "$green10";

      return (
        <Text color={color} fontWeight="500">
          {formatValue(value)}
        </Text>
      );
    },
  },
  {
    id: "category",
    label: "Category",
    accessor: "sparepart",
    sortable: false,
    width: 160,
    render: (value: any) => <Text>{formatValue(value?.category?.name)}</Text>,
  },
  {
    id: "calculation",
    label: "Calculation",
    accessor: "calculation",
    sortable: false,
    width: 160,
    align: "right",
    render: (value: number, row: any) => {
      const total = (row.quantity || 0) * (row.price || 0);
      return <Text>{formatValue(total?.toLocaleString())}</Text>;
    },
  },
  {
    id: "stockyard",
    label: "Warehouse",
    accessor: "stockyard",
    sortable: true,
    width: 160,
    align: "center",
    render: (value: any) => <Text>{formatValue(value?.name)}</Text>,
  },
  {
    id: "location",
    label: "Location",
    accessor: "location",
    sortable: true,
    width: 160,
    render: (value: any) => (
      <Text numberOfLines={1}>{formatValue(value?.name)}</Text>
    ),
  },
  {
    id: "last_updated",
    label: "Last Updated",
    accessor: "sparepart",
    sortable: true,
    width: 160,
    render: (value: any) => {
      const date = value?.updated_at;
      if (!date) return <Text>—</Text>;
      return <Text>{formatValue(new Date(date).toLocaleDateString())}</Text>;
    },
  },
];
