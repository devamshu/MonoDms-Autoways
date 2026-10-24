import { useAppSelector } from "../../../../../app/features/hooks";
import { formatValue } from "../../../app/utils/validator/emptyFiledValidaotr";
import { StatusBadge } from "../../../components/custom/status/vehicleStattus";
import { DefaultImages } from "../../../constants/image";
import { Image } from "react-native";
import { Card, ScrollView, Text, YStack } from "tamagui";
import { VehicleDetailCard } from "../vehicle/vehicleDetailCard";

interface DealerVehicleDetailScreenProps {
  id: string;
}

export function DealerVehicleDetailScreen({
  id,
}: DealerVehicleDetailScreenProps) {
  const { inventory } = useAppSelector(
    (state) => state.warehouseDealerVehicle,
  );

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

  const dmsVehicle = vehicle.dms_vehicle;
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
            { label: "Fuel Type", value: formatValue(vehicle.vehicle_type) },
            {
              label: "Chassis No.",
              value: formatValue(vehicle.chassis_no),
              copyable: true,
            },
            {
              label: "Engine No.",
              value: formatValue(vehicle.engine_no),
              copyable: true,
            },
          ]}
        />

        <VehicleDetailCard
          title="Registration"
          rows={[
            {
              label: "Register No.",
              value: formatValue(vehicle.vehicle_register_no),
              copyable: true,
            },
            {
              label: "Register Date",
              value: vehicle.vehicle_register_date
                ? new Date(
                    vehicle.vehicle_register_date,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-",
            },
          ]}
        />

        <VehicleDetailCard
          title="Inventory Information"
          rows={[
            {
              label: "Current Status",
              value: (
                <StatusBadge status={vehicle.current_status || "UNKNOWN"} />
              ),
            },
            {
              label: "Stock Date",
              value: vehicle.stock_date
                ? new Date(vehicle.stock_date).toLocaleDateString("en-GB", {
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
