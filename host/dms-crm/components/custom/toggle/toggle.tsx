import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";

const { width } = Dimensions.get("window");

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ToggleOption {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ToggleProps {
  options: ToggleOption[];
  defaultOptionId?: string;
  onChange?: (optionId: string) => void;
  containerStyle?: object;
}

export function Toggle({
  options,
  defaultOptionId,
  onChange,
  containerStyle,
}: ToggleProps) {
  const [activeId, setActiveId] = useState(defaultOptionId || options[0]?.id);
  const [contentHeight, setContentHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = options.findIndex((opt) => opt.id === activeId);
  const buttonWidth = 100 / options.length;
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    // Animate slide indicator
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start();

    // Animate content change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeId]);

  const handlePress = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  const tabWidth = containerWidth / options.length;

  const translateX = slideAnim.interpolate({
    inputRange: [0, options.length - 1],
    outputRange: [0, (options.length - 1) * (100 / options.length)],
  });

  return (
    <YStack gap="$4" style={containerStyle}>
      {/* Toggle Buttons */}
      <XStack
        backgroundColor="#E6E6E6"
        borderRadius={99}
        padding="$1"
        position="relative"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Animated Sliding Background */}
        <Animated.View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: tabWidth - 8,
            height: "100%",
            backgroundColor: "white",
            borderRadius: 99,

            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, options.length - 1],
                  outputRange: [0, tabWidth * (options.length - 1)],
                }),
              },
            ],

            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            zIndex: 0,
          }}
        />

        {/* Option Buttons */}
        <XStack flex={1} justifyContent="space-around">
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handlePress(option.id)}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <XStack
                paddingVertical="$2"
                paddingHorizontal="$3"
                alignItems="center"
                justifyContent="center"
                borderRadius="$8"
                minHeight={40}
              >
                <Text
                  fontSize={14}
                  fontWeight={activeId === option.id ? "600" : "400"}
                  color={activeId === option.id ? "$black" : "$gray11"}
                  textAlign="center"
                >
                  {option.label}
                </Text>
              </XStack>
            </TouchableOpacity>
          ))}
        </XStack>
      </XStack>

      {/* Content Area */}
      <YStack
        onLayout={(event) => {
          setContentHeight(event.nativeEvent.layout.height);
        }}
        overflow="hidden"
      >
        <Animated.View
          style={{
            flexDirection: "row",
            width: width * options.length,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, options.length - 1],
                  outputRange: [0, -(width * (options.length - 1))],
                }),
              },
            ],
          }}
        >
          {options.map((option) => (
            <YStack
              key={option.id}
              width={`${100 / options.length}%`}
              padding="$1"
            >
              {option.content}
            </YStack>
          ))}
        </Animated.View>
      </YStack>
    </YStack>
  );
}
