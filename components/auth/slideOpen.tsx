import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  Animated,
  BackHandler,
  Dimensions,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
} from "react-native";

import { ArrowLeft } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

type OpenOptions = {
  // Push onto the existing slide-over stack instead of replacing it, so the
  // header's back arrow returns to the previous screen instead of closing
  // all the way out. Off by default — most callers (e.g. the QR-scan flows)
  // intentionally replace the current screen.
  push?: boolean;
};

// Lets the screen currently on top intercept the header back-arrow instead
// of navigating away immediately — e.g. to show a "discard changes?"
// confirmation. Call `proceed()` to continue the navigation once confirmed;
// if there's nothing to confirm, call it synchronously.
type BeforeBackHandler = (proceed: () => void) => void;

type SlideOpenContextType = {
  open: (component: ReactNode, title?: string, options?: OpenOptions) => void;
  close: () => void;
  setHeaderRight: (node: ReactNode | null) => void;
  setBeforeBack: (handler: BeforeBackHandler | null) => void;
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

interface SlideEntry {
  content: ReactNode;
  title?: string;
  headerRight: ReactNode | null;
  beforeBack: BeforeBackHandler | null;
}

export const SlideOpenProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  // A stack rather than a single slot — most opens still collapse it down to
  // one entry (matching the old replace-in-place behavior), but a caller can
  // opt into pushing on top so the back arrow can return to what was open
  // before instead of dropping all the way back to the underlying route.
  const [stack, setStack] = useState<SlideEntry[]>([]);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const goBackRef = useRef<(() => void) | null>(null);
  // Set when `open` mounts the panel, so the effect below knows to run the
  // entrance animation once the view actually exists.
  const pendingEnterRef = useRef(false);

  // Run the entrance animation only after the panel has mounted.
  //
  // Starting it inside `open` ran the clock before the view existed — and
  // while JS was still busy mounting the screen being opened — so by the time
  // the panel appeared most of the duration had already elapsed and it snapped
  // into place. Closing always looked smooth because the view was on screen
  // before its animation started. Deferring to the next frame gives the
  // entrance the same footing as the exit.
  useEffect(() => {
    if (!isMounted || !pendingEnterRef.current) return;
    pendingEnterRef.current = false;

    const frame = requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => cancelAnimationFrame(frame);
  }, [isMounted, slideAnim, overlayAnim]);

  useEffect(() => {
    if (!isMounted || Platform.OS !== "android") return;

    const handleBackPress = () => {
      if (goBackRef.current) {
        goBackRef.current();
        return true; // Prevent default behavior
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => subscription.remove();
  }, [isMounted]);

  const open = (
    component: ReactNode,
    title?: string,
    options?: OpenOptions,
  ) => {
    const wasMounted = stack.length > 0;
    const entry: SlideEntry = {
      content: component,
      title,
      headerRight: null,
      beforeBack: null,
    };

    // Only for a push onto an already-visible panel, where this animates the
    // content swap. On a fresh open it would animate the panel's own mount and
    // fight the slide transform below.
    if (wasMounted) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    setStack((prev) => (options?.push ? [...prev, entry] : [entry]));

    if (!wasMounted) {
      // Park the panel off-screen before it mounts; the effect above starts
      // the slide once the view is on screen.
      slideAnim.setValue(SCREEN_WIDTH);
      overlayAnim.setValue(0);
      pendingEnterRef.current = true;
      setIsMounted(true);
    }
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
      setStack([]);
    });
  };

  const current = stack[stack.length - 1];

  // Header back-arrow handler — pop to the previous screen if one was
  // pushed underneath, otherwise this is the only screen so fully close.
  // If the current screen registered a `beforeBack` guard (e.g. it has
  // unsaved progress), defer to it instead of navigating immediately.
  const goBack = () => {
    const proceed = () => {
      if (stack.length <= 1) {
        close();
        return;
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setStack((prev) => prev.slice(0, -1));
    };

    if (current?.beforeBack) {
      current.beforeBack(proceed);
    } else {
      proceed();
    }
  };

  goBackRef.current = goBack;

  const setHeaderRight = (node: ReactNode | null) => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice();
      next[next.length - 1] = { ...next[next.length - 1], headerRight: node };
      return next;
    });
  };

  const setBeforeBack = (handler: BeforeBackHandler | null) => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice();
      next[next.length - 1] = { ...next[next.length - 1], beforeBack: handler };
      return next;
    });
  };

  return (
    <SlideOpenContext.Provider
      value={{ open, close, setHeaderRight, setBeforeBack }}
    >
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
                onPress={goBack}
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
                {current?.title ?? ""}
              </Text>

              {current?.headerRight}
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
              {current?.content}
            </YStack>
          </Animated.View>
        </>
      )}
    </SlideOpenContext.Provider>
  );
};
