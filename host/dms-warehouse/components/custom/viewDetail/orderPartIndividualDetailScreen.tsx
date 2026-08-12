import { ScrollView, Text, YStack } from "tamagui";
import { useAppSelector } from "../../../../../app/features/hooks";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { VehicleDetailCard } from "../vehicle/vehicleDetailCard";

interface OrderPartsIndividualDetailScreenProps {
  id: string;
  orderId: string;
}

export function OrderPartsIndividualDetailScreen({
  id,
  orderId,
}: OrderPartsIndividualDetailScreenProps) {
  const { orders } = useAppSelector((state) => state.warehouseOrders);
  const order = orders.find((o) => o.id === parseInt(orderId));
  const part =
    order?.order_items?.find((p) => String(p.id) === String(id)) ?? null;

  if (!part) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">Part not found</Text>
      </YStack>
    );
  }

  const sparepart = part.sparepart_details;

  return (
    <ScrollView flex={1} backgroundColor="$backgroundSecondary">
      <YStack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {formatValue(sparepart?.name)}
        </Text>

        <VehicleDetailCard
          title="Basic Information"
          rows={[
            { label: "Part Code", value: formatValue(sparepart?.part_code) },
            {
              label: "Category",
              value: formatValue(sparepart?.category?.name),
            },
            { label: "Remarks", value: formatValue(sparepart?.remarks) },
          ]}
        />
        <VehicleDetailCard
          title="Inventory Information"
          rows={[
            {
              label: "Dispatch Qty",
              value: formatValue(part.ordered_quantity),
            },
            {
              label: "Received Qty",
              value: formatValue(part.received_quantity),
            },

            {
              label: "Damage Qty",
              value: formatValue(part.damage_quantity),
            },
            {
              label: "Short Qty",
              value: formatValue(part.short_quantity),
            },
            {
              label: "Excess Qty",
              value: formatValue(part.excess_quantity),
            },
          ]}
        />
      </YStack>
    </ScrollView>
  );
}
