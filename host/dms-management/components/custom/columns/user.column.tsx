import { Text } from "tamagui";
import { Column } from "../../../components/custom/table/types";

export const getUsersColumns = (onPress: (id: string) => void): Column[] => [
  {
    id: "id",
    label: "SN",
    accessor: "id",
    sortable: true,
    width: 60,
    align: "center",
  },
  {
    id: "username",
    label: "Username",
    accessor: "username",
    sortable: true,
    width: 120,
    render: (value: string, row: any) => (
      <Text
        color="$primary"
        fontWeight="500"
        numberOfLines={1}
        onPress={() => onPress(String(row.id))}
      >
        {value}
      </Text>
    ),
  },
  {
    id: "email",
    label: "Email",
    accessor: "email",
    sortable: false,
    width: 240,
    render: (value: string) => (
      <Text numberOfLines={1} color="$color">
        {value}
      </Text>
    ),
  },
  {
    id: "is_staff",
    label: "Role",
    accessor: "is_staff",
    sortable: true,
    width: 100,
    render: (value: boolean, row: any) => (
      <Text numberOfLines={1}>
        {row.is_superuser ? "Superuser" : value ? "Staff" : "User"}
      </Text>
    ),
  },
  {
    id: "is_active",
    label: "Status",
    accessor: "is_active",
    sortable: true,
    width: 90,
    render: (value: boolean) => (
      <Text
        numberOfLines={1}
        style={{ color: value ? "#10B981" : "#EF4444", fontWeight: "500" }}
      >
        {value ? "Active" : "Inactive"}
      </Text>
    ),
  },
  {
    id: "last_login",
    label: "Last Login",
    accessor: "last_login",
    sortable: true,
    width: 130,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {value ? new Date(value).toLocaleDateString() : "—"}
      </Text>
    ),
  },
  {
    id: "last_activity",
    label: "Last Activity",
    accessor: "last_activity",
    sortable: true,
    width: 130,
    render: (value: string | null) => (
      <Text numberOfLines={1} color="$color">
        {value ? new Date(value).toLocaleDateString() : "—"}
      </Text>
    ),
  },
];
