import { DmsVehicle, MasterItem, StagedVehicle } from "../../../app/features/customer/types";
import { Button } from "../buttons/button";
import { Dropdown, DropdownOption } from "../dropdown";
import { Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Text, XStack, YStack } from "tamagui";

type Props = {
  /** Master vehicle list — drives the top-level Vehicle dropdown. */
  vehicles: MasterItem[];
  vehiclesLoading: boolean;
  /** DMS-vehicle combinations for the selected master vehicle. */
  dmsVehicles: DmsVehicle[];
  dmsVehiclesLoading: boolean;
  /** Called when the user picks a master vehicle — parent should load DMS data. */
  onFetchDmsVehicles: (vehicleId: string) => void;
  /** Called to clear DMS data when selection is cleared. */
  onClearDmsVehicles: () => void;
  /** Vehicles already staged on the form. */
  stagedVehicles: StagedVehicle[];
  onStagedChange: (next: StagedVehicle[]) => void;
};

/**
 * DMS-vehicle cascade. Picking a master vehicle triggers `onFetchDmsVehicles`
 * so the parent can load `/dms-vehicle/` combinations; the returned rows drive
 * the Variant → Color → Model Year selects. "Add Vehicle" resolves the picked
 * combination to its DMS record id and stages it.
 */
export function VehicleCascade({
  vehicles,
  vehiclesLoading,
  dmsVehicles,
  dmsVehiclesLoading,
  onFetchDmsVehicles,
  onClearDmsVehicles,
  stagedVehicles,
  onStagedChange,
}: Props) {
  // ── Local cascade selection (not part of the submitted form) ──────────────
  const [vehicleId, setVehicleId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [colorId, setColorId] = useState("");
  const [year, setYear] = useState("");

  // Load combinations whenever the selected vehicle changes; clear otherwise.
  useEffect(() => {
    if (vehicleId) {
      onFetchDmsVehicles(vehicleId);
    } else {
      onClearDmsVehicles();
    }
  }, [vehicleId, onFetchDmsVehicles, onClearDmsVehicles]);

  // ── Options ───────────────────────────────────────────────────────────────
  const vehicleOptions: DropdownOption[] = useMemo(
    () => vehicles.map((v) => ({ label: v.name, value: String(v.id) })),
    [vehicles],
  );

  const variantOptions: DropdownOption[] = useMemo(() => {
    const unique = new Map<string, string>();
    dmsVehicles.forEach((d) =>
      unique.set(String(d.variant.id), d.variant.name),
    );
    return [...unique].map(([value, label]) => ({ label, value }));
  }, [dmsVehicles]);

  const colorOptions: DropdownOption[] = useMemo(() => {
    const pool = variantId
      ? dmsVehicles.filter((d) => String(d.variant.id) === variantId)
      : dmsVehicles;
    const unique = new Map<string, string>();
    pool.forEach((d) => unique.set(String(d.color.id), d.color.name));
    return [...unique].map(([value, label]) => ({ label, value }));
  }, [dmsVehicles, variantId]);

  const yearOptions: DropdownOption[] = useMemo(() => {
    if (!variantId || !colorId) return [];
    const years = new Set(
      dmsVehicles
        .filter(
          (d) =>
            String(d.variant.id) === variantId &&
            String(d.color.id) === colorId,
        )
        .map((d) => d.manufacturing_year)
        .filter((y): y is string => !!y),
    );
    return [...years].map((y) => ({ label: y, value: y }));
  }, [dmsVehicles, variantId, colorId]);

  const resolvedYear =
    year || (yearOptions.length === 1 ? yearOptions[0].value : "");
  const yearRequired = yearOptions.length > 1;

  // The DMS row the current selection resolves to.
  const matched = useMemo(() => {
    if (!variantId || !colorId) return undefined;
    return dmsVehicles.find(
      (d) =>
        String(d.variant.id) === variantId &&
        String(d.color.id) === colorId &&
        (resolvedYear ? d.manufacturing_year === resolvedYear : true),
    );
  }, [dmsVehicles, variantId, colorId, resolvedYear]);

  const alreadyStaged =
    !!matched && stagedVehicles.some((s) => s.dmsId === matched.id);
  const canAdd = !!matched && !alreadyStaged && (!yearRequired || !!resolvedYear);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVehicleChange = (v: string) => {
    setVehicleId(v);
    setVariantId("");
    setColorId("");
    setYear("");
  };

  const handleVariantChange = (v: string) => {
    setVariantId(v);
    setColorId("");
    setYear("");
  };

  const handleColorChange = (v: string) => {
    setColorId(v);
    setYear("");
  };

  const addVehicle = () => {
    if (!matched || alreadyStaged) return;
    const vehicleName =
      vehicleOptions.find((o) => o.value === vehicleId)?.label ??
      matched.vehicle.name;
    onStagedChange([
      ...stagedVehicles,
      {
        dmsId: matched.id,
        vehicleName,
        variantName: matched.variant.name,
        colorName: matched.color.name,
        year: matched.manufacturing_year ?? "",
      },
    ]);
    // Reset the cascade for the next entry.
    setVehicleId("");
    setVariantId("");
    setColorId("");
    setYear("");
  };

  const removeVehicle = (dmsId: number) =>
    onStagedChange(stagedVehicles.filter((s) => s.dmsId !== dmsId));

  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="700" color="$color">
        Vehicle Information
      </Text>

      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$4"
        padding="$4"
        gap="$3"
        backgroundColor="$background"
      >
        <Dropdown
          label="Vehicle"
          placeholder={vehiclesLoading ? "Loading..." : "Select"}
          options={vehicleOptions}
          value={vehicleId}
          onChange={handleVehicleChange}
          disabled={vehiclesLoading}
        />

        <Dropdown
          label="Variant"
          placeholder={
            !vehicleId
              ? "Select vehicle first"
              : dmsVehiclesLoading
                ? "Loading..."
                : "Select"
          }
          options={variantOptions}
          value={variantId}
          onChange={handleVariantChange}
          disabled={!vehicleId || dmsVehiclesLoading}
        />

        <Dropdown
          label="Color"
          placeholder={
            !variantId
              ? "Select variant first"
              : dmsVehiclesLoading
                ? "Loading..."
                : "Select"
          }
          options={colorOptions}
          value={colorId}
          onChange={handleColorChange}
          disabled={!variantId || dmsVehiclesLoading}
        />

        <Dropdown
          label={`Model Year${yearRequired ? "" : " (optional)"}`}
          placeholder={
            !colorId
              ? "Select color first"
              : yearOptions.length === 0
                ? "No years available"
                : "Select"
          }
          options={yearOptions}
          value={resolvedYear}
          onChange={setYear}
          disabled={!colorId || yearOptions.length === 0}
        />

        <Button
          buttonVariant="primary"
          buttonText="Add Vehicle"
          onPress={addVehicle}
          disabled={!canAdd}
          loading={dmsVehiclesLoading && !!vehicleId}
        />
      </YStack>

      {/* ── Staged vehicles ── */}
      <YStack gap="$2">
        <Text fontSize="$3" fontWeight="600" color="$descriptionText">
          Selected Vehicles
        </Text>

        {stagedVehicles.length === 0 ? (
          <YStack
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$inputBorderColor"
            borderRadius="$3"
            paddingVertical="$5"
            alignItems="center"
          >
            <Text fontSize="$3" color="$secondaryText">
              No vehicles added yet.
            </Text>
          </YStack>
        ) : (
          stagedVehicles.map((item) => (
            <XStack
              key={item.dmsId}
              alignItems="center"
              justifyContent="space-between"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$3"
              backgroundColor="$background"
            >
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="600" color="$color">
                  {item.vehicleName}
                </Text>
                <Text fontSize="$2" color="$secondaryText" numberOfLines={1}>
                  {[item.variantName, item.colorName, item.year]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </YStack>
              <XStack
                onPress={() => removeVehicle(item.dmsId)}
                padding="$1"
                cursor="pointer"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color="#EF4444" />
              </XStack>
            </XStack>
          ))
        )}
      </YStack>
    </YStack>
  );
}
