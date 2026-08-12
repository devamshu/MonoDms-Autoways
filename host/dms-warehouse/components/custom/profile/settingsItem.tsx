import { ChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";
import { Separator, Text, useTheme, XStack } from "tamagui";
interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLogout?: boolean;
}

export default function SettingsItem({
  icon,
  label,
  onPress,
  isLogout,
}: SettingsItemProps) {
  const theme = useTheme();
  return (
    <>
      <Pressable onPress={onPress}>
        <XStack
          alignItems="center"
          paddingVertical="$4"
          gap="$3"
          paddingHorizontal="$2"
        >
          {icon}

          <Text
            flex={1}
            fontSize={15}
            fontWeight="500"
            color={isLogout ? theme.error?.val : theme.color?.val}
          >
            {label}
          </Text>

          <ChevronRight
            size={18}
            color={isLogout ? theme.error?.val : theme.color?.val}
          />
        </XStack>
      </Pressable>

      <Separator borderColor="$borderColor" />
    </>
  );
}
