import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

let globalKeyboardHeight = 0;

export function useToastKeyboardOffset(defaultOffset = 16) {
  // If the keyboard is already open on screen, pre-fill with the cached layout metrics
  const initialOffset =
    Keyboard.isVisible() && globalKeyboardHeight > 0
      ? globalKeyboardHeight + defaultOffset
      : defaultOffset;

  const [offset, setOffset] = useState(initialOffset);

  useEffect(() => {
    const onKeyboardShow = (event: KeyboardEvent) => {
      const height = event.endCoordinates.height;
      if (height > 0) {
        globalKeyboardHeight = height; // Update global layout cache
        setOffset(height + defaultOffset);
      }
    };

    const onKeyboardHide = () => {
      globalKeyboardHeight = 0;
      setOffset(defaultOffset);
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

    // Fallback handler: Sync metric frames instantly if initialized mid-animation
    const frameListener = Keyboard.addListener(
      "keyboardDidChangeFrame",
      (event: KeyboardEvent) => {
        if (Keyboard.isVisible() && event.endCoordinates.height > 0) {
          globalKeyboardHeight = event.endCoordinates.height;
          setOffset(event.endCoordinates.height + defaultOffset);
        }
      },
    );

    return () => {
      showListener.remove();
      hideListener.remove();
      frameListener.remove();
    };
  }, [defaultOffset]);

  return offset;
}
