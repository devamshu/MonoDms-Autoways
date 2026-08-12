import { forwardRef, ReactNode } from "react";
import { Input, InputProps, useTheme, XStack } from "tamagui";

type InputComponentProps = InputProps & {
  id?: string;
  rightIcon?: ReactNode;
  flex?: number;
  width?: number | string;
  noShadow?: boolean;
};

export const AppInput = forwardRef<any, InputComponentProps>(
  ({ id, rightIcon, flex, width, noShadow = false, ...rest }, ref) => {
    const theme = useTheme();

    return (
      <XStack
        alignItems="center"
        position="relative"
        borderRadius="$3"
        backgroundColor={theme.inputBackground?.val ?? "#fff"}
        flex={flex}
        width={width ?? "100%"}
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
          borderColor="$inputBorderColor"
          borderRadius="$3"
          color="$descriptionText"
          placeholderTextColor="$placeholder"
          focusStyle={{
            borderColor: "$primary",
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
  },
);

AppInput.displayName = "AppInput";
