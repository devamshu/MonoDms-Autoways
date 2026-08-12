import { ScrollView, Text, YStack } from "tamagui";
import { useAppSelector } from "../../../../../app/features/hooks";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { VehicleDetailCard } from "../vehicle/vehicleDetailCard";

interface PartsDetailScreenProps {
  id: string;
}

export function PartsDetailScreen({ id }: PartsDetailScreenProps) {
  const { inventory } = useAppSelector((state) => state.warehousePartStock);
  const item = inventory.find((i) => String(i.id) === String(id)) ?? null;

  if (!item) {
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

  const part = item.sparepart;

  return (
    <ScrollView flex={1} backgroundColor="$backgroundSecondary">
      <YStack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {formatValue(part?.name)}
        </Text>
        <VehicleDetailCard
          title="Basic Information"
          rows={[
            { label: "Part Code", value: formatValue(part?.part_code) },
            {
              label: "Category",
              value: formatValue(part?.category?.name),
            },
            {
              label: "Remarks",
              value: formatValue(part?.remarks),
            },
          ]}
        />

        <VehicleDetailCard
          title="Inventory Information"
          rows={[
            { label: "Warehouse", value: formatValue(item?.stockyard?.name) },
            { label: "Location", value: formatValue(item?.location?.name) },
            {
              label: "Quantity",
              value: formatValue(item?.quantity),
            },
          ]}
        />
      </YStack>
    </ScrollView>
  );
}
