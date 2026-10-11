import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../app/features/hooks";
import { fetchCustomerById } from "../../features/customer/store/customer.thunks";
import { formatValue } from "../../utils/validator/emptyFieldValidator";
import { UserDetailCard } from "../../../components/custom/users/userDetailCard";
import { useEffect } from "react";
import { ScrollView, Spinner, Text, YStack } from "tamagui";

interface CustomerDetailScreenProps {
  id: string;
}

/**
 * Read-only customer cards. Shared by the full-screen slide-over
 * (`CustomerDetailScreen`) and the customer action drawer. It renders plain
 * content — the caller owns the scroll container and outer padding.
 */
export function CustomerDetailContent({ id }: CustomerDetailScreenProps) {
  const dispatch = useAppDispatch();
  const { currentCustomer, loading, error } = useAppSelector((state) => ({
    currentCustomer: state.crmCustomer.currentCustomer,
    loading: state.crmCustomer.loading,
    error: state.crmCustomer.error,
  }));

  useEffect(() => {
    if (id) dispatch(fetchCustomerById(id));
  }, [dispatch, id]);

  // Ignore a customer left over from a previous fetch — only render the one
  // we actually asked for.
  const customer =
    currentCustomer && String(currentCustomer.id) === String(id)
      ? currentCustomer
      : null;

  if (!customer) {
    // Spinner until the fetch has run and settled, so a fresh open doesn't
    // flash "not found" before the request starts.
    if (loading || !error) {
      return (
        <YStack paddingVertical="$10" alignItems="center">
          <Spinner size="large" color="$secondaryText" />
        </YStack>
      );
    }
    return (
      <YStack paddingVertical="$10" alignItems="center">
        <Text color="$secondaryText">Customer not found</Text>
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
    <YStack gap="$4">
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
  );
}

export function CustomerDetailScreen({ id }: CustomerDetailScreenProps) {
  return (
    <ScrollView flex={1} backgroundColor="$backgroundSecondary">
      <YStack padding="$4">
        <CustomerDetailContent id={id} />
      </YStack>
    </ScrollView>
  );
}
