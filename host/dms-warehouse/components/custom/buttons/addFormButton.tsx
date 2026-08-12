import { Plus } from "lucide-react-native";
import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import { useTheme, XStack } from "tamagui";
import { useSlideOpen } from "../../../../../components/auth/slideOpen";

interface InjectedFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface AddFormButtonProps {
  component?: ReactNode | null;
  title?: string;
  icon?: ReactNode;
  onPress?: () => void;
}

export function AddFormButton({ component, title, icon, onPress }: AddFormButtonProps) {
  const theme = useTheme();
  const { open, close } = useSlideOpen();

  const handleOpen = () => {
    // If custom onPress is provided, use it instead of opening form
    if (onPress && !component) {
      onPress();
      return;
    }

    // Otherwise, open the form component in SlideOpen
    const child = isValidElement(component)
      ? cloneElement(component as ReactElement<InjectedFormProps>, {
          onClose: () => close(),
          onSuccess: () => close(),
        })
      : component;
    open(child, title);
  };

  return (
    <XStack
      position="absolute"
      bottom={100}
      right={20}
      width={56}
      height={56}
      borderRadius={28}
      backgroundColor="$primary"
      shadowColor="$transparent"
      alignItems="center"
      justifyContent="center"
      pressStyle={{ opacity: 0.8 }}
      onPress={handleOpen}
      zIndex={100002}
    >
      {icon ?? <Plus size={26} color={theme.white?.val} />}
    </XStack>
  );
}
