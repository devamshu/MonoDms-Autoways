import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
} from "react-native";

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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SlideOpenProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const open = (component: ReactNode, title?: string) => {
    console.log("slideAnim current value:", (slideAnim as any)._value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setContent(component);
    setTitle(title);
    setIsMounted(true);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      setContent(null);
      setTitle(undefined);
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

          {/* Fullscreen Right Panel — mirrors AppContent structure */}
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
            {/* Navbar — same as AppContent */}
            <XStack
              backgroundColor="$primary"
              height={Platform.OS === "ios" ? 120 : 105}
              paddingHorizontal="$4"
              alignItems="center"
              gap="$4"
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

            {/* Content — white rounded card, same as AppContent's inner YStack */}
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
