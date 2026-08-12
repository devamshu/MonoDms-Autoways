import { ArrowUpDown } from "lucide-react-native";
import { Button, Text, useTheme, XStack } from "tamagui";
import { memo, useCallback } from "react";
import { Column } from "./types";

interface TableHeaderProps {
  columns: Column[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
}

function TableHeaderComponent({
  columns,
  sortColumn,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const theme = useTheme();
  const activeColor = theme.primary?.val ?? "#6362E7";
  const inactiveColor = theme.secondaryText?.val ?? "gray";

  const handleSort = useCallback((column: Column) => {
    if (!column.sortable || !onSort) return;

    const newDirection =
      sortColumn === column.id && sortDirection === "asc" ? "desc" : "asc";
    onSort(column.id, newDirection);
  }, [sortColumn, sortDirection, onSort]);

  return (
    <XStack
      backgroundColor="$backgroundSecondary"
      borderTopWidth={1}
      borderLeftWidth={1}
      borderRightWidth={1}
      borderBottomWidth={0}
      borderColor="$inputBorderColor"
      gap="$2"
      padding="$3"
      borderTopLeftRadius={12}
      borderTopRightRadius={12}
    >
      {columns.map((column) => (
        <Button
          key={column.id}
          chromeless
          padding={0}
          width={column.width || 100}
          minWidth={column.width || 100}
          flexShrink={0}
          justifyContent={column.align === "center" ? "center" : "flex-start"}
          onPress={() => handleSort(column)}
          disabled={!column.sortable}
        >
          <XStack gap="$1" alignItems="center" pointerEvents="none">
            <Text fontWeight="600" fontSize="$3" height={20} numberOfLines={1}>
              {column.label}
            </Text>
            {column.sortable && (
              <ArrowUpDown
                size={14}
                color={sortColumn === column.id ? activeColor : inactiveColor}
              />
            )}
          </XStack>
        </Button>
      ))}
    </XStack>
  );
}

export const TableHeader = memo(TableHeaderComponent);
