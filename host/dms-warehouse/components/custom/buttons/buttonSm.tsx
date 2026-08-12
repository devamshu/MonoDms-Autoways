import { Platform } from "react-native";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { ButtonProps, GetProps, Button as TamaguiButton, Text } from "tamagui";

type IconProp = GetProps<typeof TamaguiButton>["icon"];

interface CustomButtonProps extends ButtonProps {
  buttonVariant?: "primary" | "ghost" | "disabled" | "icon";
  buttonText: string;
  iconLeft?: IconProp;
  iconRight?: IconProp;
}

export function ButtonSm({
  buttonVariant = "primary",
  buttonText,
  iconLeft,
  iconRight,
  onPress,
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
          backgroundColor: "rgba(21, 105, 179, 0.12)",
          borderWidth: 0,
          borderColor: undefined,
          text: "$primary",
        };
      case "icon":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderColor: undefined,
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
      backgroundColor={variantStyles.backgroundColor}
      borderWidth={variantStyles.borderWidth}
      borderColor={variantStyles.borderColor || "$borderThinColor"}
      borderRadius="$3"
      paddingTop="$2"
      paddingRight="$3"
      paddingBottom="$2"
      paddingLeft="$3"
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      pressStyle={{
        scale: Platform.OS === "web" ? 0.98 : 0.97,
        opacity: 0.6,
      }}
      icon={iconLeft}
      iconAfter={iconRight}
      height={props.height ?? "$8"}
      width={props.width ?? "$11"}
      {...props}
    >
      <Text fontSize="$2" fontWeight="600" color={variantStyles.text}>
        {buttonText}
      </Text>
    </TamaguiButton>
  );
}
