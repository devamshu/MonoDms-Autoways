import { useAppSelector } from "../../../../../app/features/hooks";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { StatusBadge } from "../../../components/custom/status/vehicleStattus";
import { DefaultImages } from "../../../constants/image";
import { Image } from "react-native";
import { Card, ScrollView, Text, YStack } from "tamagui";
import { VehicleDetailCard } from "../vehicle/vehicleDetailCard";

interface VehicleStockDetailScreenProps {
  id: string;
}

export function VehicleStockDetailScreen({
  id,
}: VehicleStockDetailScreenProps) {
  const { inventory } = useAppSelector((state) => state.warehouseVehicleStock);

  const vehicle = inventory.find((i) => String(i.id) === String(id)) ?? null;

  if (!vehicle) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">Vehicle not found</Text>
      </YStack>
    );
  }

  const dispatch = vehicle.dispatch;
  const dmsVehicle = dispatch?.dms_vehicle;
  const imageSource = DefaultImages.carPlaceholder;

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {formatValue(dmsVehicle?.vehicle?.name)}
        </Text>

        <Card
          backgroundColor="white"
          borderRadius="$4"
          padding={0}
          overflow="hidden"
        >
          <Image
            source={imageSource}
            style={{
              width: "100%",
              height: 220,
            }}
            resizeMode="cover"
          />
        </Card>

        <VehicleDetailCard
          title="Vehicle Information"
          rows={[
            { label: "Variant", value: formatValue(dmsVehicle?.variant?.name) },
            {
              label: "Year",
              value: formatValue(dmsVehicle?.manufacturing_year),
            },
            { label: "Color", value: formatValue(dmsVehicle?.color?.name) },
            { label: "Type", value: formatValue(dispatch?.type) },
            { label: "Mode", value: formatValue(dispatch?.vehicle_mode) },
            {
              label: "Chassis No.",
              value: formatValue(dispatch?.chassis_no),
              copyable: true,
            },
            {
              label: "Engine No.",
              value: formatValue(dispatch?.engine_no),
              copyable: true,
            },
          ]}
        />

        <VehicleDetailCard
          title="Inventory Information"
          rows={[
            {
              label: "Warehouse",
              value: formatValue(dispatch?.current_location),
            },
            {
              label: "Current Status",
              value: (
                <StatusBadge status={vehicle.current_status || "UNKNOWN"} />
              ),
            },
            {
              label: "Damage",
              value: vehicle.is_damage ? "Yes" : "No",
            },
            {
              label: "Invoice No.",
              value: formatValue(dispatch?.invoice_no),
            },
            {
              label: "Received Date",
              value: dispatch?.receiver_stockyard_received_date
                ? new Date(
                    dispatch.receiver_stockyard_received_date,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-",
            },
          ]}
        />
      </YStack>
    </ScrollView>
  );
}
