import { ChevronDown } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScrollView, Text, XStack, YStack, useTheme } from "tamagui";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../app/features/hooks";
import { useSlideOpen } from "../../../../../components/auth/slideOpen";
import { Toast } from "../../../../../components/auth/toast";
import {
  clearFormError,
  resetForm,
  setSubmitting,
  updateFormField,
} from "../../../app/features/vehicle/store/vehicle.slice";
import {
  AddVehiclePayload,
  VehicleMode,
} from "../../../app/features/vehicle/types";
import { Button } from "../../../components/custom/buttons/button";
import { SearchSelectSheet } from "../../../components/custom/filter/SearchSelectSheet";
import { AppInput } from "../../../components/custom/input";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { DEFAULT_TABLE_ORDERING } from "../../../components/custom/table/buildFetchParams";
import { BitsImages } from "../../../constants/bits";
import {
  fetchMasterColors,
  fetchMasterVariants,
  fetchMasterVehicles,
} from "../../features/master/store/master.thunks";
import { MasterColor, MasterVariant } from "../../features/master/types";
import {
  addVehicle,
  fetchVehicleStockInventory,
} from "../../features/vehicle/store/vehicle.thunks";

const successImage = BitsImages.success;
const discardImage = BitsImages.discard;

const VEHICLE_MODE_CARDS: { value: VehicleMode; label: string; image: any }[] =
  [
    { value: "petrol", label: "Petrol", image: BitsImages.petrolImage },
    { value: "diesel", label: "Diesel", image: BitsImages.diselImage },
    { value: "ev", label: "EV", image: BitsImages.evImage },
  ];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text fontSize={14} fontWeight="500" color="$color">
      {children}
    </Text>
  );
}

export function AddVehicleForm() {
  const theme = useTheme();
  const { close } = useSlideOpen();
  const dispatch = useAppDispatch();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBackgroundColor, setToastBackgroundColor] = useState("$green10");
  const [selectedSearchField, setSelectedSearchField] = useState<string | null>(
    null,
  );

  const showToastMessage = (message: string, isError = false) => {
    setToastMessage(message);
    setToastBackgroundColor(isError ? "$red10" : "$green10");
    setShowToast(true);
  };

  const { formData, isSubmitting } = useAppSelector(
    (state) => state.warehouseVehicleStock.form,
  );

  const {
    vehicles,
    variants,
    colors,
    vehiclesLoading,
    variantsLoading,
    colorsLoading,
    vehiclesHasMore,
    variantsHasMore,
    colorsHasMore,
  } = useAppSelector((state) => ({
    vehicles: state.warehouseMaster.vehicles,
    variants: state.warehouseMaster.variants,
    colors: state.warehouseMaster.colors,
    vehiclesLoading: state.warehouseMaster.vehiclesLoading,
    variantsLoading: state.warehouseMaster.variantsLoading,
    colorsLoading: state.warehouseMaster.colorsLoading,
    vehiclesHasMore: state.warehouseMaster.vehiclesHasMore,
    variantsHasMore: state.warehouseMaster.variantsHasMore,
    colorsHasMore: state.warehouseMaster.colorsHasMore,
  }));

  const [vehiclePage, setVehiclePage] = useState(1);
  const [variantPage, setVariantPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);

  const handleLoadMoreVehicles = async () => {
    const nextPage = vehiclePage + 1;
    await dispatch(fetchMasterVehicles({ page: nextPage }));
    setVehiclePage(nextPage);
  };

  const handleLoadMoreVariants = async () => {
    const nextPage = variantPage + 1;
    await dispatch(fetchMasterVariants({ page: nextPage }));
    setVariantPage(nextPage);
  };

  const handleLoadMoreColors = async () => {
    const nextPage = colorPage + 1;
    await dispatch(fetchMasterColors({ page: nextPage }));
    setColorPage(nextPage);
  };

  useEffect(() => {
    dispatch(clearFormError());

    if (vehicles.length === 0) {
      dispatch(fetchMasterVehicles());
    }
    if (variants.length === 0) {
      dispatch(fetchMasterVariants());
    }
    if (colors.length === 0) {
      dispatch(fetchMasterColors());
    }

    return () => {
      dispatch(resetForm());
    };
  }, [dispatch]);

  const vehicleOptions = vehicles.map((v) => ({
    label: v.name,
    value: v.id.toString(),
  }));

  const variantOptions = variants.map((v: MasterVariant) => ({
    label: v.name,
    value: v.id.toString(),
  }));

  const colorOptions = colors.map((c: MasterColor) => ({
    label: c.name,
    value: c.id.toString(),
  }));

  const vehicleTypeOptions = [
    { label: "2W", value: "2W" },
    { label: "4W", value: "4W" },
  ];

  const isPetrolOrDiesel =
    formData?.vehicle_mode === "petrol" || formData?.vehicle_mode === "diesel";
  const isEV = formData?.vehicle_mode === "ev";

  const handleSelectMode = (mode: VehicleMode) => {
    dispatch(updateFormField({ key: "vehicle_mode", value: mode }));
    if (mode === "ev") {
      // Engine number doesn't apply to EVs.
      dispatch(updateFormField({ key: "engine_no", value: "" }));
    } else {
      // Battery and motor numbers don't apply to petrol/diesel.
      dispatch(updateFormField({ key: "battery_no", value: "" }));
      dispatch(updateFormField({ key: "motor_no", value: "" }));
    }
  };

  const handleSubmit = async () => {
    const payload: AddVehiclePayload = {
      dispatch: formData.dispatch ?? null,
      vehicle: formData.vehicle_id ?? null,
      variant: formData.variant_id ?? null,
      color: formData.color_id ?? null,
      manufacturing_year: formData.manufacturing_year || null,
      vehicle_type: formData.vehicle_type ?? null,
      vehicle_mode: formData.vehicle_mode ?? null,
      frame_no: null,
      battery_no: isEV
        ? formData.battery_no?.trim().toUpperCase() || null
        : null,
      motor_no: isEV ? formData.motor_no?.trim().toUpperCase() || null : null,
      chassis_no: formData.chassis_no?.trim().toUpperCase() || null,
      engine_no: isPetrolOrDiesel
        ? formData.engine_no?.trim().toUpperCase() || null
        : null,
      status: "STOCK",
    };

    dispatch(setSubmitting(true));
    try {
      const result = await dispatch(addVehicle(payload)).unwrap();
      if (result) {
        dispatch(
          fetchVehicleStockInventory({
            page: 1,
            page_size: 10,
            ordering: DEFAULT_TABLE_ORDERING,
          }),
        );
        setSuccessModalOpen(true);
      }
    } catch (err) {
      showToastMessage(
        typeof err === "string" ? err : "Failed to add vehicle",
        true,
      );
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const handleCancel = () => {
    const hasValues =
      formData?.dispatch ||
      formData?.vehicle_id ||
      formData?.variant_id ||
      formData?.color_id ||
      formData?.manufacturing_year ||
      formData?.vehicle_type ||
      formData?.vehicle_mode ||
      formData?.chassis_no ||
      formData?.engine_no;

    if (hasValues) {
      setCancelModalOpen(true);
    } else {
      dispatch(resetForm());
      close();
    }
  };

  const handleDiscard = () => {
    setCancelModalOpen(false);
    dispatch(resetForm());
    close();
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    dispatch(resetForm());
    close();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1} marginTop="$4">
          <ScrollView
            flex={1}
            contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text fontSize={28} fontWeight="bold" color={theme.color?.val}>
              Add Vehicle
            </Text>

            {/* Vehicle Mode — card selector, filters which fields show below */}
            <YStack gap="$4">
              <Text fontSize={16} fontWeight="600" color={theme.color?.val}>
                Vehicle Mode
              </Text>

              <XStack gap="$3">
                {VEHICLE_MODE_CARDS.map(({ value, label, image }) => {
                  const selected = formData?.vehicle_mode === value;
                  return (
                    <YStack
                      key={value}
                      flex={1}
                      borderRadius="$3"
                      overflow="hidden"
                      borderWidth={1.5}
                      borderColor={
                        selected
                          ? theme.primary?.val
                          : theme.inputBorderColor?.val
                      }
                      backgroundColor={theme.background?.val}
                      onPress={() => !isSubmitting && handleSelectMode(value)}
                      pressStyle={{ opacity: 0.85 }}
                      shadowColor={
                        selected ? theme.primary?.val : "rgba(0,0,0,0.1)"
                      }
                      shadowOffset={{ width: 0, height: selected ? 4 : 2 }}
                      shadowOpacity={selected ? 0.25 : 0.06}
                      shadowRadius={selected ? 6 : 4}
                      elevation={selected ? 5 : 2}
                    >
                      <YStack
                        height={90}
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="transparent"
                      >
                        <Image
                          source={image}
                          style={{ width: 56, height: 56 }}
                          resizeMode="contain"
                        />
                      </YStack>

                      <YStack
                        alignItems="center"
                        justifyContent="center"
                        paddingVertical="$2"
                        backgroundColor={
                          selected
                            ? theme.primary?.val
                            : theme.backgroundSecondary?.val
                        }
                      >
                        <Text
                          fontSize={10}
                          fontWeight="600"
                          color={
                            selected
                              ? theme.white?.val
                              : theme.secondaryText?.val
                          }
                        >
                          {label}
                        </Text>
                      </YStack>
                    </YStack>
                  );
                })}
              </XStack>
            </YStack>

            {/* Vehicle Information — only once a mode is picked above.
                Petrol/Diesel and EV show the same fields except Engine
                Number, which doesn't apply to EVs. */}
            {formData?.vehicle_mode && (
              <YStack gap="$4">
                <Text fontSize={16} fontWeight="700" color={theme.color?.val}>
                  Vehicle Information
                </Text>

                {/* Vehicle Name */}
                <YStack gap="$2">
                  <FieldLabel>Vehicle Name</FieldLabel>
                  <Pressable
                    onPress={() =>
                      !isSubmitting && setSelectedSearchField("vehicle")
                    }
                    disabled={isSubmitting || vehiclesLoading}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          height: 50,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          borderWidth: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor:
                            theme.inputBackground?.val ?? "#f9fafb",
                          borderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
                          opacity:
                            isSubmitting || vehiclesLoading
                              ? 0.45
                              : pressed
                                ? 0.85
                                : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: formData?.vehicle_id
                              ? (theme.descriptionText?.val ?? "#111")
                              : (theme.placeholder?.val ?? "#9ca3af"),
                            flex: 1,
                            opacity: formData?.vehicle_id ? 1 : 0.65,
                          }}
                          numberOfLines={1}
                        >
                          {vehicleOptions.find(
                            (v) => v.value === formData?.vehicle_id?.toString(),
                          )?.label || "Select Vehicle"}
                        </Text>
                        <ChevronDown
                          size={18}
                          color={theme.descriptionText?.val ?? "#111"}
                        />
                      </View>
                    )}
                  </Pressable>
                </YStack>

                {/* Variant */}
                <YStack gap="$2">
                  <FieldLabel>Variant</FieldLabel>
                  <Pressable
                    onPress={() =>
                      !isSubmitting && setSelectedSearchField("variant")
                    }
                    disabled={isSubmitting || variantsLoading}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          height: 50,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          borderWidth: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor:
                            theme.inputBackground?.val ?? "#f9fafb",
                          borderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
                          opacity:
                            isSubmitting || variantsLoading
                              ? 0.45
                              : pressed
                                ? 0.85
                                : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: formData?.variant_id
                              ? (theme.descriptionText?.val ?? "#111")
                              : (theme.placeholder?.val ?? "#9ca3af"),
                            flex: 1,
                            opacity: formData?.variant_id ? 1 : 0.65,
                          }}
                          numberOfLines={1}
                        >
                          {variantOptions.find(
                            (v: { label: string; value: string }) =>
                              v.value === formData?.variant_id?.toString(),
                          )?.label || "Select Variant"}
                        </Text>
                        <ChevronDown
                          size={18}
                          color={theme.descriptionText?.val ?? "#111"}
                        />
                      </View>
                    )}
                  </Pressable>
                </YStack>

                {/* Color */}
                <YStack gap="$2">
                  <FieldLabel>Color</FieldLabel>
                  <Pressable
                    onPress={() =>
                      !isSubmitting && setSelectedSearchField("color")
                    }
                    disabled={isSubmitting || colorsLoading}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          height: 50,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          borderWidth: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor:
                            theme.inputBackground?.val ?? "#f9fafb",
                          borderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
                          opacity:
                            isSubmitting || colorsLoading
                              ? 0.45
                              : pressed
                                ? 0.85
                                : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: formData?.color_id
                              ? (theme.descriptionText?.val ?? "#111")
                              : (theme.placeholder?.val ?? "#9ca3af"),
                            flex: 1,
                            opacity: formData?.color_id ? 1 : 0.65,
                          }}
                          numberOfLines={1}
                        >
                          {colorOptions.find(
                            (c: { label: string; value: string }) =>
                              c.value === formData?.color_id?.toString(),
                          )?.label || "Select Color"}
                        </Text>
                        <ChevronDown
                          size={18}
                          color={theme.descriptionText?.val ?? "#111"}
                        />
                      </View>
                    )}
                  </Pressable>
                </YStack>

                {/* Manufacturing Year */}
                <YStack gap="$2">
                  <FieldLabel>Manufacturing Year</FieldLabel>
                  <AppInput
                    placeholder="Enter year (e.g., 2024)"
                    value={formData?.manufacturing_year || ""}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
                      dispatch(
                        updateFormField({
                          key: "manufacturing_year",
                          value: cleaned,
                        }),
                      );
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    disabled={isSubmitting}
                  />
                </YStack>

                {/* Vehicle Type */}
                <YStack gap="$2">
                  <FieldLabel>Vehicle Type</FieldLabel>
                  <Pressable
                    onPress={() =>
                      !isSubmitting && setSelectedSearchField("vehicleType")
                    }
                    disabled={isSubmitting}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          height: 50,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          borderWidth: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor:
                            theme.inputBackground?.val ?? "#f9fafb",
                          borderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
                          opacity: isSubmitting ? 0.45 : pressed ? 0.85 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: formData?.vehicle_type
                              ? (theme.descriptionText?.val ?? "#111")
                              : (theme.placeholder?.val ?? "#9ca3af"),
                            flex: 1,
                            opacity: formData?.vehicle_type ? 1 : 0.65,
                          }}
                          numberOfLines={1}
                        >
                          {vehicleTypeOptions.find(
                            (v) => v.value === formData?.vehicle_type,
                          )?.label || "Select Vehicle Type"}
                        </Text>
                        <ChevronDown
                          size={18}
                          color={theme.descriptionText?.val ?? "#111"}
                        />
                      </View>
                    )}
                  </Pressable>
                </YStack>

                {/* Chassis Number — petrol/diesel only */}
                {isPetrolOrDiesel && (
                  <YStack gap="$2">
                    <FieldLabel>Chassis Number</FieldLabel>
                    <AppInput
                      placeholder="Enter chassis number"
                      value={formData?.chassis_no || ""}
                      onChangeText={(text) =>
                        dispatch(
                          updateFormField({ key: "chassis_no", value: text }),
                        )
                      }
                      autoCapitalize="characters"
                      disabled={isSubmitting}
                    />
                  </YStack>
                )}

                {/* Engine Number — petrol/diesel only */}
                {isPetrolOrDiesel && (
                  <YStack gap="$2">
                    <FieldLabel>Engine Number</FieldLabel>
                    <AppInput
                      placeholder="Enter engine number"
                      value={formData?.engine_no || ""}
                      onChangeText={(text) =>
                        dispatch(
                          updateFormField({ key: "engine_no", value: text }),
                        )
                      }
                      autoCapitalize="characters"
                      disabled={isSubmitting}
                    />
                  </YStack>
                )}

                {/* Motor Number — EV only */}
                {isEV && (
                  <YStack gap="$2">
                    <FieldLabel>Motor Number</FieldLabel>
                    <AppInput
                      placeholder="Enter motor number"
                      value={formData?.motor_no || ""}
                      onChangeText={(text) =>
                        dispatch(
                          updateFormField({ key: "motor_no", value: text }),
                        )
                      }
                      autoCapitalize="characters"
                      disabled={isSubmitting}
                    />
                  </YStack>
                )}

                {/* Battery Number — EV only */}
                {isEV && (
                  <YStack gap="$2">
                    <FieldLabel>Battery Number</FieldLabel>
                    <AppInput
                      placeholder="Enter battery number"
                      value={formData?.battery_no || ""}
                      onChangeText={(text) =>
                        dispatch(
                          updateFormField({ key: "battery_no", value: text }),
                        )
                      }
                      autoCapitalize="characters"
                      disabled={isSubmitting}
                    />
                  </YStack>
                )}
              </YStack>
            )}
          </ScrollView>

          {/* Footer Buttons — outside ScrollView to stay visible with keyboard */}
          <XStack
            gap="$3"
            padding="$4"
            paddingBottom="$4"
            backgroundColor="$background"
          >
            <Button
              flex={1}
              buttonVariant="ghost"
              buttonText="Cancel"
              onPress={handleCancel}
              disabled={isSubmitting}
            />
            <Button
              flex={1}
              buttonVariant="primary"
              buttonText={isSubmitting ? "Submitting..." : "Add"}
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          </XStack>

          {/* Success Modal */}
          <GenericModal
            isOpen={successModalOpen}
            variant="continueOnly"
            title="Successful!"
            description="Vehicle has been added successfully."
            imageSource={successImage}
            buttonText="Continue"
            onButtonPress={handleSuccessClose}
          />

          {/* Cancel Confirmation Modal */}
          <GenericModal
            isOpen={cancelModalOpen}
            variant="discard"
            title="Discard Changes"
            imageSource={discardImage}
            description="You have unsaved changes. If you leave now, your updates will be lost."
            cancelText="Cancel"
            confirmText="Discard"
            onCancel={() => setCancelModalOpen(false)}
            onConfirm={handleDiscard}
          />

          {/* Vehicle Search-Select Sheet */}
          <SearchSelectSheet
            open={selectedSearchField === "vehicle"}
            onClose={() => setSelectedSearchField(null)}
            options={vehicleOptions}
            value={formData?.vehicle_id?.toString() || ""}
            onChange={(value) =>
              dispatch(
                updateFormField({
                  key: "vehicle_id",
                  value: parseInt(value),
                }),
              )
            }
            title="Select Vehicle"
            isLoading={vehiclesLoading}
            onEndReached={handleLoadMoreVehicles}
          />

          {/* Variant Search-Select Sheet */}
          <SearchSelectSheet
            open={selectedSearchField === "variant"}
            onClose={() => setSelectedSearchField(null)}
            options={variantOptions}
            value={formData?.variant_id?.toString() || ""}
            onChange={(value) =>
              dispatch(
                updateFormField({
                  key: "variant_id",
                  value: parseInt(value),
                }),
              )
            }
            title="Select Variant"
            isLoading={variantsLoading}
            onEndReached={handleLoadMoreVariants}
          />

          {/* Color Search-Select Sheet */}
          <SearchSelectSheet
            open={selectedSearchField === "color"}
            onClose={() => setSelectedSearchField(null)}
            options={colorOptions}
            value={formData?.color_id?.toString() || ""}
            onChange={(value) =>
              dispatch(
                updateFormField({
                  key: "color_id",
                  value: parseInt(value),
                }),
              )
            }
            title="Select Color"
            isLoading={colorsLoading}
            onEndReached={handleLoadMoreColors}
          />

          {/* Vehicle Type Search-Select Sheet */}
          <SearchSelectSheet
            open={selectedSearchField === "vehicleType"}
            onClose={() => setSelectedSearchField(null)}
            options={vehicleTypeOptions}
            value={formData?.vehicle_type || ""}
            onChange={(value) =>
              dispatch(updateFormField({ key: "vehicle_type", value }))
            }
            title="Select Vehicle Type"
          />

          <Toast
            show={showToast}
            message={toastMessage}
            backgroundColor={toastBackgroundColor}
            onDismiss={() => setShowToast(false)}
          />
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
