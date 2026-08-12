import { submitMultiStepForm } from "../../features/customer/store/customer.thunks";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { Button } from "../../../components/custom/buttons/button";
import { CustomerStepperOne } from "../../../components/custom/customer/customerStepperOne";
import { CustomerStepperThree } from "../../../components/custom/customer/customerStepperThree";
import { VehicleCascade } from "../../../components/custom/customer/vehicleCascade";
import { StepIndicator } from "../../../components/custom/customer/stepIndicator";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { useSlideOpen } from "../../../../../components/auth/slideOpen";
import { BitsImages } from "../../../constants/bits";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { ScrollView, XStack, YStack } from "tamagui";
import { toast } from "../../../../../components/auth/toast";
import {
    clearFormError,
    nextStep,
    previousStep,
    resetMultiStepForm,
    setEmailEntries,
    setPhoneEntries,
    setVehicleEntries,
    updateFormField,
} from "../../../app/features/customer/store/customer.slice";
import {
    fetchMasterCities,
    fetchMasterCountries,
    fetchMasterInquiryKinds,
    fetchMasterSourceTypes,
    fetchMasterVehicles,
    fetchDmsVehiclesForVehicle,
} from "../../../app/features/master/store/master.thunks";
import { resetDmsVehicles } from "../../../app/features/master/store/master.slice";
import {
    clearFieldError,
    clearFilledContactErrors,
    FieldErrors,
    validateStep,
} from "../../features/customer/validation";

const successImage = BitsImages.success;
const discardImage = BitsImages.discard;
const confirmationImage = BitsImages.confirmation;

export function AddCustomerForm() {
  const { close } = useSlideOpen();
  const dispatch = useAppDispatch();

  // Get form state from Redux
  const {
    currentStep,
    formData,
    vehicleEntries,
    isSubmitting,
    phoneEntries,
    emailEntries,
  } = useAppSelector((state) => ({
    currentStep: state.crmCustomer.multiStepForm.currentStep,
    formData: state.crmCustomer.multiStepForm.formData,
    vehicleEntries: state.crmCustomer.multiStepForm.vehicleEntries,
    isSubmitting: state.crmCustomer.multiStepForm.isSubmitting,
    phoneEntries: state.crmCustomer.multiStepForm.phoneEntries,
    emailEntries: state.crmCustomer.multiStepForm.emailEntries,
  }));

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  // Populated only once the user tries to advance, so a pristine form isn't
  // covered in red before they have typed anything.
  const [errors, setErrors] = useState<FieldErrors>({});

  const {
    inquiryKinds,
    countries,
    cities,
    sourceTypes,
    vehicles,
    dmsVehicles,
    inquiryKindsLoading,
    countriesLoading,
    citiesLoading,
    sourceTypesLoading,
    vehiclesLoading,
    dmsVehiclesLoading,
  } = useAppSelector((state) => ({
    inquiryKinds: state.crmMaster.inquiryKinds,
    countries: state.crmMaster.countries,
    cities: state.crmMaster.cities,
    sourceTypes: state.crmMaster.sourceTypes,
    vehicles: state.crmMaster.vehicles,
    dmsVehicles: state.crmMaster.dmsVehicles,
    inquiryKindsLoading: state.crmMaster.inquiryKindsLoading,
    countriesLoading: state.crmMaster.countriesLoading,
    citiesLoading: state.crmMaster.citiesLoading,
    sourceTypesLoading: state.crmMaster.sourceTypesLoading,
    vehiclesLoading: state.crmMaster.vehiclesLoading,
    dmsVehiclesLoading: state.crmMaster.dmsVehiclesLoading,
  }));

  useEffect(() => {
    // Clear any previous errors when form mounts
    dispatch(clearFormError());

    // Load master data
    dispatch(fetchMasterInquiryKinds());
    dispatch(fetchMasterCountries());
    dispatch(fetchMasterCities());
    dispatch(fetchMasterSourceTypes());
    dispatch(fetchMasterVehicles());

    // Cleanup on unmount
    return () => {
      dispatch(resetMultiStepForm());
      dispatch(resetDmsVehicles());
    };
  }, [dispatch]);

  const handleFetchDmsVehicles = (vehicleId: string) => {
    dispatch(fetchDmsVehiclesForVehicle(vehicleId));
  };

  const handleClearDmsVehicles = () => {
    dispatch(resetDmsVehicles());
  };

  const handleSubmit = async () => {
    try {
      const result = await dispatch(
        submitMultiStepForm({
          formData,
          phoneEntries,
          emailEntries,
          vehicleEntries,
        }),
      ).unwrap();

      setConfirmModalOpen(false);
      if (result) {
        setSuccessModalOpen(true);
      }
    } catch (err: any) {
      setConfirmModalOpen(false);
      // unwrap() throws the rejectWithValue string; fall back for object errors.
      toast.error(
        typeof err === "string" && err
          ? err
          : err?.message || "Failed to add customer",
      );
    }
  };

  const onNext = () => {
    const stepErrors = validateStep(currentStep, {
      formData,
      phoneEntries,
      emailEntries,
    });

    // Blocks both advancing a step and opening the submit confirmation.
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    if (currentStep === 3) {
      setConfirmModalOpen(true);
    } else {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    if (currentStep === 1) {
      setDiscardModalOpen(true);
    } else {
      // Going back must not carry the abandoned step's red state along.
      setErrors({});
      dispatch(previousStep());
    }
  };

  const handleDiscard = () => {
    setDiscardModalOpen(false);
    dispatch(resetMultiStepForm());
    close();
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    dispatch(resetMultiStepForm());
    close();
  };

  const totalSteps = 3;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1}>
          <StepIndicator
            current={currentStep}
            total={totalSteps}
            form={formData}
          />
          <XStack
            height={1}
            backgroundColor="$inputBorderColor"
            marginHorizontal="$4"
          />

          <ScrollView
            flex={1}
            contentContainerStyle={{ padding: 16, gap: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 1 && (
              <CustomerStepperOne
                form={formData}
                onChange={(key, value) => {
                  dispatch(updateFormField({ key, value }));
                  setErrors((prev) => clearFieldError(prev, key));
                }}
                inquiryKinds={inquiryKinds}
                countries={countries}
                cities={cities}
                sourceTypes={sourceTypes}
                inquiryKindsLoading={inquiryKindsLoading}
                countriesLoading={countriesLoading}
                citiesLoading={citiesLoading}
                sourceTypesLoading={sourceTypesLoading}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <VehicleCascade
                vehicles={vehicles}
                vehiclesLoading={vehiclesLoading}
                dmsVehicles={dmsVehicles}
                dmsVehiclesLoading={dmsVehiclesLoading}
                onFetchDmsVehicles={handleFetchDmsVehicles}
                onClearDmsVehicles={handleClearDmsVehicles}
                stagedVehicles={vehicleEntries}
                onStagedChange={(entries) =>
                  dispatch(setVehicleEntries(entries))
                }
              />
            )}
            {currentStep === 3 && (
              <CustomerStepperThree
                phoneEntries={phoneEntries}
                emailEntries={emailEntries}
                onPhoneEntriesChange={(entries) => {
                  dispatch(setPhoneEntries(entries));
                  setErrors((prev) =>
                    clearFilledContactErrors(prev, entries, emailEntries),
                  );
                }}
                onEmailEntriesChange={(entries) => {
                  dispatch(setEmailEntries(entries));
                  setErrors((prev) =>
                    clearFilledContactErrors(prev, phoneEntries, entries),
                  );
                }}
                errors={errors}
              />
            )}
          </ScrollView>

          <XStack
            padding="$4"
            paddingBottom="$6"
            gap="$3"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            backgroundColor="$background"
          >
            <Button
              flex={1}
              buttonVariant="ghost"
              buttonText={currentStep === 1 ? "Cancel" : "Back"}
              onPress={onBack}
              disabled={isSubmitting}
            />
            <Button
              flex={1}
              buttonVariant="primary"
              buttonText={
                isSubmitting
                  ? "Submitting..."
                  : currentStep === 3
                    ? "Submit"
                    : "Next"
              }
              onPress={onNext}
              disabled={isSubmitting}
            />
          </XStack>

          <GenericModal
            isOpen={successModalOpen}
            variant="continueOnly"
            title="Successful!"
            description="Customer has been added successfully."
            imageSource={successImage}
            buttonText="Continue"
            onButtonPress={handleSuccessClose}
          />

          <GenericModal
            isOpen={discardModalOpen}
            variant="discard"
            title="Discard Changes"
            description="You have unsaved changes. If you leave now, your updates will be lost."
            imageSource={discardImage}
            cancelText="Cancel"
            confirmText="Discard"
            onCancel={() => setDiscardModalOpen(false)}
            onConfirm={handleDiscard}
          />

          <GenericModal
            isOpen={confirmModalOpen}
            variant="confirmCancel"
            title="Add Customer"
            description="Please verify the details before adding customer."
            imageSource={confirmationImage}
            cancelText="Cancel"
            confirmText="Confirm"
            loading={isSubmitting}
            onCancel={() => setConfirmModalOpen(false)}
            onConfirm={handleSubmit}
          />
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
