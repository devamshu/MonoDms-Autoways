import { ScrollView, Spinner, Text, YStack } from "tamagui";
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

export function Table({
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
  // Yet To Optimize
  const totalWidth = columns.reduce((sum, col) => {
    const width =
      typeof col.width === "number" ? col.width : Number(col.width) || 100;
    return sum + width;
  }, 0);

  const shouldDistribute = totalWidth < 800;
  const hasRows = !isLoading && data.length > 0;

  return (
    <YStack width="100%">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          paddingRight: 1,
          minWidth: "100%", // Ensure minimum width is 100%
        }}
      >
        <YStack width="100%" minWidth={shouldDistribute ? "100%" : undefined}>
          <TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          {hasRows &&
            data.map((item, index) => (
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

      {/* Only the body is replaced while loading or when a search matches
          nothing — the header and column layout stay put. Rendered outside the
          horizontal scroller so the message stays centered in the viewport
          instead of in the (possibly much wider) scroll content. */}
      {isLoading && (
        <YStack alignItems="center" justifyContent="center" padding="$8">
          <Spinner size="large" color="$primary" />
          <Text marginTop="$3" color="$secondaryText">
            Loading...
          </Text>
        </YStack>
      )}

      {!isLoading && data.length === 0 && (
        <YStack alignItems="center" justifyContent="center" padding="$8">
          <Text color="$secondaryText">{emptyMessage}</Text>
        </YStack>
      )}
    </YStack>
  );
}
