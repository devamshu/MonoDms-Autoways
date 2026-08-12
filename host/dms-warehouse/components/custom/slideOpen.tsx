import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

import { Animated, Dimensions, Platform, TouchableOpacity } from "react-native";

import { ArrowLeft } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

type SlideOpenContextType = {
  open: (component: ReactNode, title?: string) => void;
  close: () => void;
};

const SlideOpenContext = createContext<SlideOpenContextType | undefined>(
  undefined,
);

export const useSlideOpen = () => {
  const context = useContext(SlideOpenContext);
  if (!context)
    throw new Error("useSlideOpen must be used within SlideOpenProvider");
  return context;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

// Common animation configuration
const ANIMATION_DURATION = 300;
const EASING = (t: number) => t; // Linear easing for both

export const SlideOpenProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const open = (component: ReactNode, title?: string) => {
    // Set content first
    setContent(component);
    setTitle(title);
    setIsMounted(true);

    // Reset animation values before starting
    slideAnim.setValue(SCREEN_WIDTH);
    overlayAnim.setValue(0);

    // Use the same duration and easing as close animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: EASING,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: EASING,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: EASING,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: EASING,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
        setContent(null);
        setTitle(undefined);
      }
    });
  };

  return (
    <SlideOpenContext.Provider value={{ open, close }}>
      {children}

      {isMounted && (
        <>
          {/* Overlay */}
          <Animated.View
            pointerEvents="auto"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "black",
              opacity: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
              zIndex: 100000,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={close}
              style={{ flex: 1 }}
            />
          </Animated.View>

          {/* Fullscreen Right Panel */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: SCREEN_WIDTH,
              zIndex: 100001,
              transform: [{ translateX: slideAnim }],
              backgroundColor: "transparent",
            }}
          >
            {/* Navbar */}
            <XStack
              backgroundColor="$primary"
              height={Platform.OS === "ios" ? 120 : 105}
              paddingHorizontal="$4"
              alignItems="center"
              gap="$4"
              paddingTop={Platform.OS === "ios" ? 20 : 20}
            >
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>

              <Text
                flex={1}
                fontSize={24}
                fontWeight="700"
                color="white"
                numberOfLines={1}
              >
                {title ?? ""}
              </Text>
            </XStack>

            <YStack
              flex={1}
              backgroundColor="$background"
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              marginTop={-20}
              overflow="hidden"
            >
              {content}
            </YStack>
          </Animated.View>
        </>
      )}
    </SlideOpenContext.Provider>
  );
};
