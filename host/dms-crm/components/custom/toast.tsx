import { BitsImages } from "@/constants/bits";
import { useToastKeyboardOffset } from "@/hooks/useToastKeyboardOffset";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";

interface ToastOptions {
  message: string;
  title?: string;
  duration?: number;
}

class ToastManager {
  private listeners: ((
    options: ToastOptions & { type: "success" | "error" },
  ) => void)[] = [];

  subscribe(
    listener: (options: ToastOptions & { type: "success" | "error" }) => void,
  ) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private show(options: ToastOptions & { type: "success" | "error" }) {
    this.listeners.forEach((listener) => listener(options));
  }

  success(message: string, duration?: number, title?: string) {
    this.show({ message, type: "success", duration, title });
  }

  error(message: string, duration?: number, title?: string) {
    this.show({ message, type: "error", duration, title });
  }
}

export const toast = new ToastManager();

interface ToastComponentProps {
  type: "success" | "error";
  message: string;
  title?: string;
  duration?: number;
  onHide: () => void;
}

const CircleIcon = ({ type }: { type: "success" | "error" }) => {
  const isSuccess = type === "success";

  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 24,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexShrink: 0,
      }}
    >
      {isSuccess ? (
        <Image
          source={BitsImages.tick}
          style={{
            width: 32,
            height: 32,
          }}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={BitsImages.cross}
          style={{
            width: 32,
            height: 32,
          }}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const ToastComponent = ({
  type,
  message,
  title,
  duration = 3000,
  onHide,
}: ToastComponentProps) => {
  const keyboardOffset = useToastKeyboardOffset(38);
  const isSuccess = type === "success";
  const theme = useTheme();

  const backgroundColor = isSuccess
    ? theme.successBackground
    : theme.background;
  const titleColor = isSuccess ? theme.success : theme.error;
  const bodyColor = theme.descriptionText;

  const defaultTitle = isSuccess ? "Success!" : "Error!";
  const displayTitle = title || defaultTitle;

  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        // Must sit above the slideOpen panel (zIndex 100001) so error
        // toasts fired from inside a slide-over stay visible.
        zIndex: 1000000,
      }}
    >
      <YStack
        position="absolute"
        bottom={keyboardOffset}
        left="$4"
        right="$4"
        alignSelf="stretch"
        paddingHorizontal="$4"
        paddingVertical="$4"
        backgroundColor={backgroundColor}
        zIndex={1000}
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.12}
        shadowRadius={10}
        elevation={6}
      >
        <XStack alignItems="center" gap="$3">
          <CircleIcon type={type} />

          <YStack flex={1} gap="$1">
            <Text
              fontSize="$4"
              fontWeight="700"
              color={titleColor}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Text
              fontSize="$3"
              fontWeight="400"
              color={bodyColor}
              numberOfLines={3}
            >
              {message}
            </Text>
          </YStack>

          <TouchableOpacity
            onPress={onHide}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={20} color={theme.success?.val} strokeWidth={2.5} />
          </TouchableOpacity>
        </XStack>
      </YStack>
    </View>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastState, setToastState] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
    title?: string;
    duration?: number;
  }>({
    visible: false,
    type: "success",
    message: "",
    title: undefined,
    duration: 3000,
  });

  useEffect(() => {
    const unsubscribe = toast.subscribe(
      ({ message, type, duration, title }) => {
        setToastState({
          visible: true,
          type,
          message,
          title,
          duration: duration || 3000,
        });
      },
    );

    return unsubscribe;
  }, []);

  const hideToast = () => {
    setToastState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      {children}
      {toastState.visible && (
        <ToastComponent
          type={toastState.type}
          message={toastState.message}
          title={toastState.title}
          duration={toastState.duration}
          onHide={hideToast}
        />
      )}
    </>
  );
};

// For backward compatibility
export const Toast = ({
  show,
  message,
  title,
  onDismiss,
  autoDismissMs = 3000,
  backgroundColor,
}: any) => {
  useEffect(() => {
    if (show) {
      if (backgroundColor === "$green10") {
        toast.success(message, autoDismissMs, title);
      } else if (backgroundColor === "$red10") {
        toast.error(message, autoDismissMs, title);
      } else {
        toast.error(message, autoDismissMs, title);
      }
      if (onDismiss) {
        setTimeout(onDismiss, autoDismissMs);
      }
    }
  }, [show, message, title, onDismiss, autoDismissMs, backgroundColor]);

  return null;
};
