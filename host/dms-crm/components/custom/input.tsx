import { forwardRef, ReactNode } from "react";
import { Input, InputProps, Text, useTheme, XStack, YStack } from "tamagui";

type InputComponentProps = InputProps & {
  id?: string;
  rightIcon?: ReactNode;
  flex?: number;
  width?: number | string;
  noShadow?: boolean;
  /** Validation message. Reddens the border and renders below the field. */
  error?: string;
};

export const AppInput = forwardRef<any, InputComponentProps>(
  ({ id, rightIcon, flex, width, noShadow = false, error, ...rest }, ref) => {
    const theme = useTheme();

    const field = (
      <XStack
        alignItems="center"
        position="relative"
        borderRadius="$3"
        backgroundColor={theme.inputBackground?.val ?? "#fff"}
        // When wrapped for an error message the YStack owns the sizing, so the
        // row must fill it rather than compete with it.
        flex={error ? undefined : flex}
        width={error ? "100%" : (width ?? "100%")}
        {...(!noShadow && {
          shadowColor: "$black",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 3.84,
        })}
      >
        <Input
          ref={ref}
          id={id}
          flex={1}
          height={50}
          borderWidth={1}
          backgroundColor="transparent"
          fontSize="$4"
          borderColor={error ? "$error" : "$inputBorderColor"}
          borderRadius="$3"
          color="$descriptionText"
          placeholderTextColor="$placeholder"
          focusStyle={{
            borderColor: error ? "$error" : "$primary",
            borderWidth: 1,
          }}
          paddingHorizontal="$4"
          paddingRight={rightIcon ? "$14" : "$4"}
          {...rest}
        />

        {rightIcon && (
          <XStack
            position="absolute"
            right="$3"
            top={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            pointerEvents="box-none"
          >
            {rightIcon}
          </XStack>
        )}
      </XStack>
    );

    // Only wrap when there is something to show, so every existing call site
    // keeps the exact tree — and the exact flex behaviour — it has today.
    if (!error) return field;

    return (
      <YStack gap="$1" flex={flex} width={width ?? "100%"}>
        {field}
        <Text fontSize="$2" color="$error" paddingLeft="$1">
          {error}
        </Text>
      </YStack>
    );
  },
);

AppInput.displayName = "AppInput";
