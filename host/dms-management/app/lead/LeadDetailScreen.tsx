import { useAppSelector } from "../../../../app/features/hooks";
import { formatValue } from "../../app/utils/validator/emptyFieldValidator";
import { UserDetailCard } from "../../components/custom/users/userDetailCard";
import { ScrollView, Text, YStack } from "tamagui";

interface LeadDetailScreenProps {
  id: string;
}

export function LeadDetailScreen({ id }: LeadDetailScreenProps) {
  const { customers } = useAppSelector((state) => state.managementDashboard);
  const customer = customers.find((c) => String(c.id) === String(id)) ?? null;

  if (!customer) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">Lead not found</Text>
      </YStack>
    );
  }

  const vehicleRows = customer.vehicle_details?.length
    ? customer.vehicle_details.flatMap((v, i) => [
        { label: `Vehicle ${i + 1}`, value: formatValue(v.vehicle_name) },
        { label: `Variant ${i + 1}`, value: formatValue(v.variant_name) },
        { label: `Color ${i + 1}`, value: formatValue(v.color_name) },
      ])
    : [{ label: "Vehicles", value: "No vehicles" }];

  const contactRows = [
    ...(customer.phone.length
      ? customer.phone.map((p, i) => ({
          label: i === 0 ? "Mobile" : `Phone ${i + 1}`,
          value: formatValue(p.phone),
        }))
      : [{ label: "Mobile", value: formatValue(customer.contact) }]),
    ...customer.email.map((e, i) => ({
      label: i === 0 ? "Email" : `Email ${i + 1}`,
      value: formatValue(e.email),
    })),
  ];

  return (
    <ScrollView flex={1} backgroundColor="$backgroundSecondary">
      <YStack padding="$4" gap="$4">
        <UserDetailCard
          title="Customer Information"
          rows={[
            { label: "Inquiry No.", value: formatValue(customer.inq_no) },
            { label: "Name", value: formatValue(customer.name) },
            { label: "Inquiry Kind", value: formatValue(customer.kind_name) },
            { label: "Gender", value: formatValue(customer.gender) },
            { label: "Address 1", value: formatValue(customer.address) },
            { label: "Address 2", value: formatValue(customer.address2) },
            { label: "Country", value: formatValue(customer.country_name) },
            { label: "City", value: formatValue(customer.city_name) },
            {
              label: "Source Type",
              value: formatValue(customer.inquiry_source_name),
            },
            { label: "Remarks", value: formatValue(customer.remarks) },
          ]}
        />

        <UserDetailCard title="Vehicle Information" rows={vehicleRows} />

        <UserDetailCard title="Contact Information" rows={contactRows} />
      </YStack>
    </ScrollView>
  );
}
