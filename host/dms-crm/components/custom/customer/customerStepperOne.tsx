import { CustomerFormData, MasterItem } from "../../../app/features/customer/types";
import { FieldErrors } from "../../../app/features/customer/validation";
import { Dropdown } from "../../../components/custom/dropdown";
import { AppInput } from "../../../components/custom/input";
import { Text, YStack } from "tamagui";
import { RequiredLabel } from "../requiredLabel";

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

type Props = {
  form: CustomerFormData;
  onChange: (key: keyof CustomerFormData, value: string) => void;
  inquiryKinds: MasterItem[];
  countries: MasterItem[];
  cities: MasterItem[];
  sourceTypes: MasterItem[];
  inquiryKindsLoading: boolean;
  countriesLoading: boolean;
  citiesLoading: boolean;
  sourceTypesLoading: boolean;
  errors?: FieldErrors;
};

export function CustomerStepperOne({
  form,
  onChange,
  inquiryKinds,
  countries,
  cities,
  sourceTypes,
  inquiryKindsLoading,
  countriesLoading,
  citiesLoading,
  sourceTypesLoading,
  errors = {},
}: Props) {
  const toOptions = (items: MasterItem[]) =>
    items.map((i) => ({ label: i.name, value: i.id.toString() }));

  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="700" color="$color">
        Customer Information
      </Text>

      <YStack gap="$1">
        <RequiredLabel>First Name</RequiredLabel>
        <AppInput
          value={form.first_name}
          onChangeText={(v) => onChange("first_name", v)}
          placeholder="Enter first name"
          error={errors.first_name}
        />
      </YStack>

      <YStack gap="$1">
        <Text fontSize="$3" color="$color">
          Middle Name
        </Text>
        <AppInput
          value={form.middle_name}
          onChangeText={(v) => onChange("middle_name", v)}
          placeholder="Enter middle name"
        />
      </YStack>

      <YStack gap="$1">
        <RequiredLabel>Last Name</RequiredLabel>
        <AppInput
          value={form.last_name}
          onChangeText={(v) => onChange("last_name", v)}
          placeholder="Enter last name"
          error={errors.last_name}
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

      <Dropdown
        label="Gender"
        required
        placeholder="Select"
        options={GENDER_OPTIONS}
        value={form.gender}
        onChange={(v) => onChange("gender", v)}
        error={errors.gender}
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
        label="Country"
        required
        placeholder={countriesLoading ? "Loading..." : "Select"}
        options={toOptions(countries)}
        value={form.country ?? ""}
        onChange={(v) => onChange("country" as keyof CustomerFormData, v)}
        disabled={countriesLoading}
        error={errors.country}
      />

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
