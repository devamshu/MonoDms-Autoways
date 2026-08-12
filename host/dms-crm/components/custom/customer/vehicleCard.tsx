import { MasterItem, VehicleEntry } from "../../../app/features/customer/types";
import { Dropdown } from "../../../components/custom/dropdown";
import { Trash2 } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

type Props = {
  index: number;
  entry: VehicleEntry;
  canDelete: boolean;
  vehicles: MasterItem[];
  variants: MasterItem[];
  colors: MasterItem[];
  vehiclesLoading: boolean;
  variantsLoading: boolean;
  colorsLoading: boolean;
  onChange: (
    id: string,
    key: keyof Omit<VehicleEntry, "id">,
    value: string,
  ) => void;
  onDelete: (id: string) => void;
};

export function VehicleCard({
  index,
  entry,
  canDelete,
  vehicles,
  variants,
  colors,
  vehiclesLoading,
  variantsLoading,
  colorsLoading,
  onChange,
  onDelete,
}: Props) {
  const vehicleOptions = vehicles.map((i) => ({
    label: i.name,
    value: i.id.toString(),
  }));
  const variantOptions = variants.map((i) => ({
    label: i.name,
    value: i.id.toString(),
  }));
  const colorOptions = colors.map((i) => ({
    label: i.name,
    value: i.id.toString(),
  }));

  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$4"
      padding="$4"
      gap="$3"
      backgroundColor="$background"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$4" fontWeight="700" color="$color">
          Vehicle {index + 1}
        </Text>
        {canDelete && (
          <XStack
            onPress={() => onDelete(entry.id)}
            padding="$1"
            cursor="pointer"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={20} color="#EF4444" />
          </XStack>
        )}
      </XStack>

      <Dropdown
        label="Vehicle"
        required
        placeholder={vehiclesLoading ? "Loading..." : "Select"}
        options={vehicleOptions}
        value={entry.vehicle}
        onChange={(v) => onChange(entry.id, "vehicle", v)}
        disabled={vehiclesLoading}
      />

      <Dropdown
        label="Variant"
        placeholder={variantsLoading ? "Loading..." : "Select"}
        options={variantOptions}
        value={entry.variant}
        onChange={(v) => onChange(entry.id, "variant", v)}
        disabled={variantsLoading}
      />

      <Dropdown
        label="Color"
        required
        placeholder={colorsLoading ? "Loading..." : "Select"}
        options={colorOptions}
        value={entry.color}
        onChange={(v) => onChange(entry.id, "color", v)}
        disabled={colorsLoading}
      />
    </YStack>
  );
}