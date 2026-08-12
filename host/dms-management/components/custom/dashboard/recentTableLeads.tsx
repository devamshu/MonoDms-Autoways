// host/dms-management/components/custom/dashboard/RecentLeadsTable.tsx
import { Text, YStack } from "tamagui";
import { getCustomerColumns } from "../columns/customer.columns";
import { TableMain } from "../table/main";
import { FetchParams } from "../table/types";

interface RecentLeadsTableProps {
  customers: any[];
  customersCount: number;
  customersLoading: boolean;
  onFetchData: (params: FetchParams) => Promise<void>;
  onPressCustomer: (id: string) => void;
}

export function RecentLeadsTable({
  customers,
  customersCount,
  customersLoading,
  onFetchData,
  onPressCustomer,
}: RecentLeadsTableProps) {
  const columns = getCustomerColumns(onPressCustomer);

  return (
    <YStack gap="$2">
      <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
        Recent Leads
      </Text>
      <TableMain
        columns={columns}
        data={customers}
        totalItems={customersCount}
        onFetchData={onFetchData}
        enableSearch={false}
        enablePagination={false}
        enableColumnManagement={false}
        enableSorting
        itemsPerPage={5}
        itemsPerPageOptions={[5, 10, 25]}
        keyExtractor={(item) =>
          item?.id?.toString() ?? Math.random().toString()
        }
        emptyMessage="No leads found"
        isLoading={customersLoading}
        showCard
      />
    </YStack>
  );
}
