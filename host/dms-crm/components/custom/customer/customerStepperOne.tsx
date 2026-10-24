import { CustomerFormData, MasterItem } from "../../../app/features/customer/types";
import { FieldErrors } from "../../../app/features/customer/validation";
import { Dropdown, DropdownOption } from "../../../components/custom/dropdown";
import { AppInput } from "../../../components/custom/input";
import { Text, YStack } from "tamagui";
import { RequiredLabel } from "../requiredLabel";

type Props = {
  form: CustomerFormData;
  onChange: (key: keyof CustomerFormData, value: string) => void;
  inquiryKinds: MasterItem[];
  cities: MasterItem[];
  sourceTypes: MasterItem[];
  inquiryKindsLoading: boolean;
  citiesLoading: boolean;
  sourceTypesLoading: boolean;
  errors?: FieldErrors;
  isAdmin?: boolean;
  employeeOptions?: DropdownOption[];
  employeesLoading?: boolean;
  employeesLoadingMore?: boolean;
  onEmployeesEndReached?: () => void;
};

export function CustomerStepperOne({
  form,
  onChange,
  inquiryKinds,
  cities,
  sourceTypes,
  inquiryKindsLoading,
  citiesLoading,
  sourceTypesLoading,
  errors = {},
  isAdmin = false,
  employeeOptions = [],
  employeesLoading = false,
  employeesLoadingMore = false,
  onEmployeesEndReached,
}: Props) {
  const toOptions = (items: MasterItem[]) =>
    items.map((i) => ({ label: i.name, value: i.id.toString() }));

  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="700" color="$color">
        Customer Information
      </Text>

      <YStack gap="$1">
        <RequiredLabel>Name</RequiredLabel>
        <AppInput
          value={form.name}
          onChangeText={(v) => onChange("name", v)}
          placeholder="Enter name"
          error={errors.name}
        />
      </YStack>

      <Dropdown
        label="Inquiry Kind"
        required
        placeholder={inquiryKindsLoading ? "Loading..." : "Select"}
        options={toOptions(inquiryKinds)}
        value={form.inquiry_kind}
        onChange={(v) => onChange("inquiry_kind", v)}
        disabled={inquiryKindsLoading}
        error={errors.inquiry_kind}
      />

      <YStack gap="$1">
        <RequiredLabel>Address</RequiredLabel>
        <AppInput
          value={form.address}
          onChangeText={(v) => onChange("address", v)}
          placeholder="Enter address"
          error={errors.address}
        />
      </YStack>

      <Dropdown
        label="City"
        required
        placeholder={citiesLoading ? "Loading..." : "Select"}
        options={toOptions(cities)}
        value={form.city ?? ""}
        onChange={(v) => onChange("city" as keyof CustomerFormData, v)}
        disabled={citiesLoading}
        error={errors.city}
      />

      <Dropdown
        label="Source Type"
        required
        placeholder={sourceTypesLoading ? "Loading..." : "Select"}
        options={toOptions(sourceTypes)}
        value={form.source_type}
        onChange={(v) => onChange("source_type", v)}
        disabled={sourceTypesLoading}
        error={errors.source_type}
      />

      {isAdmin && (
        <Dropdown
          label="Assigned To"
          placeholder={employeesLoading ? "Loading..." : "Select employee"}
          options={employeeOptions}
          value={form.assigned_to}
          onChange={(v) => onChange("assigned_to", v)}
          disabled={employeesLoading}
          loading={employeesLoading}
          loadingMore={employeesLoadingMore}
          onEndReached={onEmployeesEndReached}
        />
      )}

      <YStack gap="$1">
        <RequiredLabel>Phone</RequiredLabel>
        <AppInput
          value={form.phone}
          onChangeText={(v) => onChange("phone", v)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.phone}
        />
      </YStack>

      <YStack gap="$1">
        <Text fontSize="$3" color="$color">
          Email
        </Text>
        <AppInput
          value={form.email}
          onChangeText={(v) => onChange("email", v)}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </YStack>

      <YStack gap="$1">
        <Text fontSize="$3" color="$color">
          Remarks
        </Text>
        <AppInput
          value={form.remarks}
          onChangeText={(v) => onChange("remarks", v)}
          placeholder="Enter remarks"
          multiline
          numberOfLines={4}
          height={96}
          paddingVertical="$2"
        />
      </YStack>
    </YStack>
  );
}
