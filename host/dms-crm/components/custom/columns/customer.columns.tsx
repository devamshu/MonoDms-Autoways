import { Column } from "@/components/custom/table/types";
import { Text } from "tamagui";
import { formatValue } from "../../../app/utils/validator/emptyFieldValidator";

const safeFormat = (value: any): string => {
  if (value === null || value === undefined) return "—";
  return formatValue(value);
};

const safeToString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export const getCustomerColumns = (onPress: (id: string) => void): Column[] => [
  {
    id: "sn",
    label: "SN",
    accessor: "id",
    width: 60,
    align: "center",
    render: (_value: any, _row: any, index?: number) => (
      <Text fontWeight="500" numberOfLines={1}>
        {index != null ? index + 1 : "—"}
      </Text>
    ),
  },
  {
    id: "inq_no",
    label: "Inquiry. No",
    accessor: "inq_no",
    sortable: true,
    width: 80,
    render: (value: any) => (
      <Text numberOfLines={1} color="$color">
        {safeFormat(value)}
      </Text>
    ),
  },
  {
    id: "name",
    label: "Name",
    accessor: "name",
    sortable: true,
    width: 130,
    render: (value: any, row: any) => {
      const safeId = row?.id ? safeToString(row.id) : "";
      const safeName = safeFormat(value);

      return (
        <Text
          color="$primary"
          fontWeight="500"
          numberOfLines={1}
          onPress={() => {
            if (safeId) {
              onPress(safeId);
            } else {
              console.warn("Cannot navigate - invalid row id:", row);
            }
          }}
        >
          {safeName}
        </Text>
      );
    },
  },
  {
    id: "inquiry_date",
    label: "Inquiry Date",
    accessor: "inquiry_date",
    sortable: true,
    width: 100,
    render: (value: any) => {
      if (!value) return <Text numberOfLines={1}>—</Text>;
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return <Text numberOfLines={1}>—</Text>;
        return (
          <Text numberOfLines={1} color="$color">
            {date.toLocaleDateString()}
          </Text>
        );
      } catch (error) {
        console.error("Error formatting date:", error);
        return <Text numberOfLines={1}>—</Text>;
      }
    },
  },
  {
    id: "inquiry_age",
    label: "Inquiry Age",
    accessor: "inquiry_age",
    sortable: true,
    width: 90,
    render: (value: any) => (
      <Text numberOfLines={1} color="$color">
        {safeFormat(value)}
      </Text>
    ),
  },
  {
    id: "kind_name",
    label: "Kind",
    accessor: "kind_name",
    sortable: true,
    width: 70,
    render: (value: any) => <Text numberOfLines={1}>{safeFormat(value)}</Text>,
  },
  {
    id: "is_converted_to_deal",
    label: "Converted",
    accessor: "is_converted_to_deal",
    sortable: true,
    width: 70,
    render: (value: any) => {
      const isConverted = value === true || value === "true" || value === 1;
      return <Text numberOfLines={1}>{isConverted ? "Yes" : "No"}</Text>;
    },
  },
];
