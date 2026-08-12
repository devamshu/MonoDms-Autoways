import { MasterItem, VehicleEntry } from "@/app/features/customer/types";
import { Text, XStack, YStack } from "tamagui";
import { VehicleCard } from "./vehicleCard";

type Props = {
  addVehicle: boolean;
  onToggleAddVehicle: (val: boolean) => void;
  vehicleEntries: VehicleEntry[];
  onVehicleEntriesChange: (entries: VehicleEntry[]) => void;
  vehicles: MasterItem[];
  variants: MasterItem[];
  colors: MasterItem[];
  vehiclesLoading: boolean;
  variantsLoading: boolean;
  colorsLoading: boolean;
};

export function CustomerStepperTwo({
  addVehicle,
  onToggleAddVehicle,
  vehicleEntries,
  onVehicleEntriesChange,
  vehicles,
  variants,
  colors,
  vehiclesLoading,
  variantsLoading,
  colorsLoading,
}: Props) {
  const handleToggle = () => {
    const next = !addVehicle;
    onToggleAddVehicle(next);
    if (next && vehicleEntries.length === 0) {
      onVehicleEntriesChange([
        { id: Date.now().toString(), vehicle: "", variant: "", color: "" },
      ]);
    }
  };

  const handleChange = (
    id: string,
    key: keyof Omit<VehicleEntry, "id">,
    value: string,
  ) =>
    onVehicleEntriesChange(
      vehicleEntries.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    );

  const handleDelete = (id: string) => {
    const updated = vehicleEntries.filter((e) => e.id !== id);
    if (updated.length === 0) onToggleAddVehicle(false);
    onVehicleEntriesChange(updated);
  };

  const handleAddMore = () =>
    onVehicleEntriesChange([
      ...vehicleEntries,
      { id: Date.now().toString(), vehicle: "", variant: "", color: "" },
    ]);

  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="700" color="$color">
        Vehicle Information
      </Text>

      {/* Checkbox */}
      <XStack
        alignItems="center"
        gap="$2"
        onPress={handleToggle}
        cursor="pointer"
      >
        <XStack
          width={20}
          height={20}
          borderRadius="$2"
          borderWidth={2}
          borderColor={addVehicle ? "$ongoing" : "$borderColor"}
          backgroundColor={addVehicle ? "$ongoing" : "transparent"}
          alignItems="center"
          justifyContent="center"
        >
          {addVehicle && (
            <Text color="white" fontSize={12} lineHeight={14} fontWeight="700">
              ✓
            </Text>
          )}
        </XStack>
        <Text fontSize="$4" color="$color">
          Add Vehicle
        </Text>
      </XStack>

      {addVehicle && (
        <YStack gap="$3">
          {vehicleEntries.map((entry, index) => (
            <VehicleCard
              key={entry.id}
              index={index}
              entry={entry}
              canDelete={vehicleEntries.length > 1}
              vehicles={vehicles}
              variants={variants}
              colors={colors}
              vehiclesLoading={vehiclesLoading}
              variantsLoading={variantsLoading}
              colorsLoading={colorsLoading}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}

          <XStack
            onPress={handleAddMore}
            alignItems="center"
            cursor="pointer"
            paddingVertical="$2"
          >
            <Text fontSize="$4" color="$ongoing" fontWeight="600">
              + Add More
            </Text>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
