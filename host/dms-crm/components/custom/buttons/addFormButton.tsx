import { useSlideOpen } from "../../../../../components/auth/slideOpen";
import { Plus } from "lucide-react-native";
import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import { XStack } from "tamagui";

interface InjectedFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface AddFormButtonProps {
  component: ReactNode;
  title?: string;
  icon?: ReactNode;
}

export function AddFormButton({ component, title, icon }: AddFormButtonProps) {
  const { open, close } = useSlideOpen();

  const handleOpen = () => {
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
      pressStyle={{ opacity: 0.01 }}
      onPress={handleOpen}
      zIndex={999}
    >
      {icon ?? <Plus size={26} color="#fff" />}
    </XStack>
  );
}
