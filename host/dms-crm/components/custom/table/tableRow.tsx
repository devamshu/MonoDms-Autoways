import { memo } from "react";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { Column } from "./types";

interface TableRowProps {
  row: any;
  columns: Column[];
  index: number;
  onPress?: (row: any) => void;
}

function TableRowComponent({ row, columns, index, onPress }: TableRowProps) {
  const content = (
    <XStack
      gap="$2"
      padding="$3"
      borderWidth={0.5}
      borderColor="$inputBorderColor"
    >
      {columns.map((column) => {
        const value = row[column.accessor];
        const rendered = column.render
          ? column.render(value, row, index)
          : value;
        const columnWidth = column.width || 100;
        const isPrimitive =
          typeof rendered === "string" ||
          typeof rendered === "number" ||
          typeof rendered === "boolean";

        return (
          <YStack
            key={column.id}
            width={columnWidth}
            minWidth={columnWidth}
            flexShrink={0}
            alignItems={column.align === "center" ? "center" : "flex-start"}
            overflow="hidden"
          >
            {isPrimitive ? (
              <Text fontSize="$3" color="$color" numberOfLines={1}>
                {String(rendered)}
              </Text>
            ) : (
              rendered
            )}
          </YStack>
        );
      })}
    </XStack>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(row)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Rows are pure in (row, columns, index, onPress). With stable `columns` and
// `onPress` references from the parent, this skips re-rendering every cell when
// unrelated screen state changes (e.g. opening the action drawer).
export const TableRow = memo(TableRowComponent);
