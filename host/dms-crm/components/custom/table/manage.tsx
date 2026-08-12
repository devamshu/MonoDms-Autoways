import { useEffect, useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import { Button as Custom } from "../buttons/button";
import { BottomDrawer } from "../drawer";
import { DraggableColumnList } from "./draggableColumnList";
import { Column } from "./types";

interface ManageColumnsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  visibleColumns: string[];
  columnOrder: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onReset?: () => void;
  onApply?: (visibleColumns: string[], columnOrder: string[]) => void;
}

export function ManageColumns({
  open,
  onOpenChange,
  columns,
  visibleColumns,
  columnOrder,
  onVisibleColumnsChange,
  onColumnOrderChange,
  onReset,
  onApply,
}: ManageColumnsProps) {
  const [tempVisibleColumns, setTempVisibleColumns] =
    useState<string[]>(visibleColumns);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>(columnOrder);
  const [noColumnsError, setNoColumnsError] = useState(false);

  // Seed the working copy every time the drawer opens.
  //
  // This used to sit in an `if (isOpen)` branch of the drawer's onOpenChange,
  // which never ran: the parent opens this by setting `open` directly, and the
  // Sheet only ever reports `onOpenChange(false)` when it dismisses itself. The
  // temp state was therefore frozen at whatever the columns were when the table
  // first mounted, so the first Apply wrote those stale ids back and left the
  // table with no columns it could resolve.
  useEffect(() => {
    if (!open) return;
    setTempVisibleColumns(visibleColumns);
    setTempColumnOrder(columnOrder);
    setNoColumnsError(false);
    // Only the open transition should reseed — reacting to the column props
    // here would wipe the user's in-progress selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const getOrderedColumns = (): Column[] => {
    const ordered = tempColumnOrder
      .map((id) => columns.find((col) => col.id === id))
      .filter((col) => col) as Column[];
    const missing = columns.filter((col) => !tempColumnOrder.includes(col.id));
    return [...ordered, ...missing];
  };

  const toggleColumnVisibility = (columnId: string) => {
    if (tempVisibleColumns.includes(columnId)) {
      setTempVisibleColumns(tempVisibleColumns.filter((id) => id !== columnId));
    } else {
      setTempVisibleColumns([...tempVisibleColumns, columnId]);
      setNoColumnsError(false);
    }
  };

  const handleReset = () => {
    const allColumnIds = columns.map((col) => col.id);
    setTempVisibleColumns(allColumnIds);
    setTempColumnOrder(allColumnIds);
    onReset?.();
  };

  const handleApply = () => {
    if (tempVisibleColumns.length === 0) {
      setNoColumnsError(true);
      return;
    }
    onVisibleColumnsChange(tempVisibleColumns);
    onColumnOrderChange(tempColumnOrder);
    onApply?.(tempVisibleColumns, tempColumnOrder);
    onOpenChange(false);
  };

  const stickyBottomContent = (
    <YStack gap="$2">
      {noColumnsError && (
        <Text fontSize="$3" color="$error" textAlign="center">
          No columns selected. Please select at least one column.
        </Text>
      )}
      <XStack gap="$3">
        <Custom
          flex={1}
          buttonVariant="ghost"
          onPress={handleReset}
          buttonText="Reset"
        />
        <Custom
          flex={1}
          size="$4"
          buttonVariant="primary"
          onPress={handleApply}
          buttonText="Apply"
        />
      </XStack>
    </YStack>
  );

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Manage Column"
      height={75}
      stickyBottomContent={stickyBottomContent}
    >
      <DraggableColumnList
        columns={getOrderedColumns()}
        visibleColumns={tempVisibleColumns}
        onToggleVisibility={toggleColumnVisibility}
        onReorder={setTempColumnOrder}
      />
    </BottomDrawer>
  );
}
