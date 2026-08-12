import { ScrollView, Spinner, Text, YStack } from "tamagui";
import { memo, useMemo } from "react";
import { TableHeader } from "./tableHeader";
import { TableRow } from "./tableRow";
import { Column } from "./types";

interface TableProps {
  columns: Column[];
  data: any[];
  keyExtractor?: (item: any) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowPress?: (row: any) => void;
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

function TableComponent({
  columns,
  data,
  keyExtractor = (item) => item.id,
  isLoading = false,
  emptyMessage = "No data available",
  onRowPress,
  onSort,
  sortColumn,
  sortDirection,
}: TableProps) {
  if (isLoading) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$8">
        <Spinner size="large" color="$primary" />
        <Text marginTop="$3" color="$color10">
          Loading...
        </Text>
      </YStack>
    );
  }

  if (data.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$8">
        <Text color="$color10">{emptyMessage}</Text>
      </YStack>
    );
  }

  const { totalWidth, shouldDistribute } = useMemo(() => {
    const total = columns.reduce((sum, col) => {
      const width =
        typeof col.width === "number" ? col.width : Number(col.width) || 100;
      return sum + width;
    }, 0);
    return { totalWidth: total, shouldDistribute: total < 800 };
  }, [columns]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={{
        paddingRight: 1,
        minWidth: "100%",
      }}
    >
      <YStack width="100%" minWidth={shouldDistribute ? "100%" : undefined}>
        <TableHeader
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        {data.map((item, index) => (
          <TableRow
            key={keyExtractor(item)}
            row={item}
            columns={columns}
            index={index}
            onPress={onRowPress}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}

export const Table = memo(TableComponent);
