import { Platform } from "react-native";
import {
  ButtonProps,
  GetProps,
  Spinner,
  Button as TamaguiButton,
  Text,
  XStack,
} from "tamagui";

type IconProp = GetProps<typeof TamaguiButton>["icon"];

interface CustomButtonProps extends ButtonProps {
  buttonVariant?: "primary" | "ghost" | "disabled";
  buttonText: string;
  iconLeft?: IconProp;
  iconRight?: IconProp;
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  buttonVariant = "primary",
  buttonText,
  iconLeft,
  iconRight,
  onPress,
  loading = false,
  loadingText = "Please wait...",
  disabled = false,
  ...props
}: CustomButtonProps) {
  // Determine if button should be disabled
  const isDisabled = buttonVariant === "disabled" || disabled;

  // Style configurations for each variant
  const getVariantStyles = () => {
    switch (buttonVariant) {
      case "primary":
        return {
          backgroundColor: "$primary",
          borderWidth: 0,
          borderColor: undefined,
          text: "$white",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "$borderThinColor",
          text: "$primary",
        };
      case "disabled":
        return {
          backgroundColor: "$disabled",
          borderWidth: 0,
          borderColor: undefined,
          text: "$white",
        };
      default:
        return {
          backgroundColor: "$primary",
          borderWidth: 0,
          borderColor: undefined,
          text: "$white",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TamaguiButton
      {...props}
      backgroundColor={variantStyles.backgroundColor}
      borderWidth={variantStyles.borderWidth}
      borderColor={variantStyles.borderColor || "$borderThinColor"}
      borderRadius="$3"
      paddingHorizontal="$6"
      paddingVertical="$3"
      size="$10"
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      pressStyle={{
        scale: Platform.OS === "web" ? 0.98 : 0.97,
        opacity: 0.9,
      }}
      icon={iconLeft}
      iconAfter={iconRight}
    >
      {loading ? (
        <XStack gap="$2" alignItems="center">
          <Spinner color={variantStyles.text} size="small" />
          <Text fontSize="$4" fontWeight="$500" color={variantStyles.text}>
            {loadingText}
          </Text>
        </XStack>
      ) : (
        <Text fontSize="$4" fontWeight="$500" color={variantStyles.text}>
          {buttonText}
        </Text>
      )}
    </TamaguiButton>
  );
}
