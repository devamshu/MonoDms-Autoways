import { ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";
import { Button, Text, XStack, useTheme } from "tamagui";

interface ProfileButtonProps {
  icon: ReactNode;
  text: string;
  onPress: () => void;
  showArrow?: boolean;
  isLogout?: boolean;
  fullWidth?: boolean;
}

export function ProfileButton({
  icon,
  text,
  onPress,
  showArrow = true,
  isLogout = false,
  fullWidth = false,
}: ProfileButtonProps) {
  const theme = useTheme();
  const labelColor = isLogout ? theme.error?.val : theme.color?.val;
  const arrowColor = theme.text?.val;

  return (
    <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
      <Button
        onPress={onPress}
        backgroundColor="transparent"
        pressStyle={{ backgroundColor: "$backgroundHover" }}
        width="100%"
        height={53}
        paddingVertical={16}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={0}
      >
        <XStack gap={8} alignItems="center">
          {icon}
          <Text fontSize={16} lineHeight={21} fontWeight="400" color="$ghost">
            {text}
          </Text>
        </XStack>

        {showArrow && <ChevronRight size={16} color={arrowColor} />}
      </Button>
    </XStack>
  );
}
