import { useState } from "react";
import { ScrollView } from "react-native";
import { Spinner, Text, YStack } from "tamagui";
import { toast } from "../../../components/custom/toast";
import { useAppDispatch, useAppSelector } from "../../../../../app/features/hooks";
import { DiscountActionButtons } from "../../../components/custom/buttons/discountActionButton";
import { DetailCard } from "../../../components/custom/card/detailCard";
import { GenericModal } from "../../../components/custom/model/genericModal";
import { UpdateDiscountDrawer } from "../../../components/custom/updateDiscountDrawer";
import { Images } from "../../../constants/image";
import {
    approveDiscount,
    fetchDiscountById,
    rejectDiscount,
    updateDiscountAmount,
} from "../../features/discount/store/discount.thunks";
import { formatValue } from "../../utils/validator/emptyFieldValidator";

interface DiscountDetailScreenProps {
  id: string;
}

export function DiscountDetailScreen({ id }: DiscountDetailScreenProps) {
  const dispatch = useAppDispatch();
  const { discounts, selectedDiscount, loading, actionLoading } =
    useAppSelector((state) => state.crmDiscount);

  const discount =
    discounts.find((d) => String(d.id) === String(id)) ?? selectedDiscount;

  const [declineOpen, setDeclineOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  // Handle approve discount
  const handleApprove = async () => {
    try {
      await dispatch(approveDiscount(id)).unwrap();
      toast.success("Discount approved successfully");
      setAcceptOpen(false);
      // Refresh the discount data
      await dispatch(fetchDiscountById(id));
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to approve discount",
      );
    }
  };

  // Handle reject discount
  const handleReject = async () => {
    try {
      await dispatch(rejectDiscount(id)).unwrap();
      toast.success("Discount rejected successfully");
      setDeclineOpen(false);
      // Refresh the discount data
      await dispatch(fetchDiscountById(id));
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to reject discount",
      );
    }
  };

  // Handle update amount
  const handleUpdateAmount = async (amount: string) => {
    const numericAmount = parseFloat(amount);

    // Dismiss the drawer before anything can raise a toast. The drawer is
    // portaled above the toast host, so a toast fired while it is still open is
    // painted behind it and its overlay and is never seen — which is why server
    // rejections like "request is pending" used to vanish silently.
    setUpdateOpen(false);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error(
        "Please enter a valid discount amount",
        undefined,
        "Invalid Amount",
      );
      return;
    }

    try {
      await dispatch(
        updateDiscountAmount({
          id,
          payload: { amount: numericAmount },
        }),
      ).unwrap();

      toast.success("Discount amount updated successfully");
      // Refresh the discount data
      await dispatch(fetchDiscountById(id));
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to update discount amount",
      );
    }
  };

  if (loading && !discount) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  if (!discount) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$backgroundSecondary"
      >
        <Text color="$secondaryText">Discount request not found</Text>
      </YStack>
    );
  }

  // Get status display value
  const getStatusValue = () => {
    return discount.status_display || discount.status;
  };

  // Check if actions are disabled based on current status
  const isActionDisabled = discount.status !== "pending";


  return (
    <YStack flex={1} backgroundColor="$backgroundSecondary">
      <ScrollView>
        <YStack padding="$4" gap="$4">
          <DetailCard
            title="General Info"
            rows={[
              { label: "Inquiry", value: formatValue(discount.inquiry) },
              {
                label: "Requested Amount",
                value: formatValue(discount.requested_discount_amount),
              },
              {
                label: "Given Amount",
                value: formatValue(discount.given_discount_amount),
              },
              {
                label: "Max Allowed",
                value: formatValue(discount.max_allowed_amount),
              },
              { label: "Policy", value: formatValue(discount.policy_name) },
              { label: "Vehicle", value: formatValue(discount.vehicle_name) },
              {
                label: "Requested By",
                value: formatValue(
                  discount.requested_by_name || discount.requested_by,
                ),
              },
              {
                label: "Approved By",
                value: formatValue(discount.approved_by_name),
              },
              {
                label: "Rejected By",
                value: formatValue(discount.rejected_by_name),
              },
              {
                label: "Intended For",
                value: formatValue(discount.intended_for),
              },
              { label: "Remarks", value: formatValue(discount.remarks) },
              {
                label: "Status",
                value: getStatusValue(),
              },
            ]}
          />

          {!isActionDisabled && (
            <DiscountActionButtons
              onDecline={() => {
                setDeclineOpen(true);
              }}
              onUpdate={() => {
                setUpdateOpen(true);
              }}
              onAccept={() => {
                setAcceptOpen(true);
              }}
              loading={actionLoading}
            />
          )}

          {isActionDisabled && discount.status !== "pending" && (
            <YStack
              padding="$4"
              backgroundColor={
                discount.status === "approved" ? "$successLight" : "$errorLight"
              }
              borderRadius="$4"
              alignItems="center"
            >
              <Text
                color={discount.status === "approved" ? "$success" : "$error"}
                fontWeight="500"
              >
                This discount request has been {discount.status}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <GenericModal
        isOpen={declineOpen}
        variant="confirmCancel"
        title="Confirm Rejection"
        description="Are you sure you want to reject this discount?"
        imageSource={Images.confirmation}
        cancelText="Cancel"
        confirmText="Proceed"
        loading={actionLoading}
        onCancel={() => {
          setDeclineOpen(false);
        }}
        onConfirm={() => {
          handleReject();
        }}
      />

      <GenericModal
        isOpen={acceptOpen}
        variant="confirmCancel"
        title="Confirm Approval"
        description="Are you sure you want to approve this discount?"
        imageSource={Images.confirmation}
        cancelText="Cancel"
        confirmText="Proceed"
        loading={actionLoading}
        onCancel={() => {
          setAcceptOpen(false);
        }}
        onConfirm={() => {
          handleApprove();
        }}
      />

      <UpdateDiscountDrawer
        open={updateOpen}
        onClose={() => {
          setUpdateOpen(false);
        }}
        currentDiscount={formatValue(discount.requested_discount_amount)}
        maxAllowed={discount.max_allowed_amount}
        onUpdate={(amount) => {
          handleUpdateAmount(amount);
        }}
        loading={actionLoading}
      />
    </YStack>
  );
}
