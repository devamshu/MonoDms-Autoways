import { Text, YStack } from "tamagui";
import { MonthlyConversionRow } from "../../../../dms-crm/app/features/dashboard/types";
import { monthlyColumns } from "../../../app/config/monthlyColumns";
import { TableMain } from "../table/main";
import { FetchParams } from "../table/types";

interface MonthlyConversionTableProps {
  rows: MonthlyConversionRow[];
  totalItems: number;
  limit: number;
  onFetchData: (params: FetchParams) => Promise<void>;
  isLoading: boolean;
}

export function MonthlyConversionTable({
  rows,
  totalItems,
  limit,
  onFetchData,
  isLoading,
}: MonthlyConversionTableProps) {
  return (
    <YStack gap="$2">
      <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
        Lead Conversion
      </Text>
      <TableMain
        columns={monthlyColumns}
        data={rows}
        totalItems={totalItems}
        onFetchData={onFetchData}
        enablePagination
        enableSorting
        itemsPerPage={limit}
        itemsPerPageOptions={[5, 10, 15]}
        keyExtractor={(item) => item.id}
        emptyMessage="No conversion data"
        isLoading={isLoading}
        enableSearch={false}
        enableColumnManagement={false}
        showCard
      />
    </YStack>
  );
}
