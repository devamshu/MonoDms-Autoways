import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSidebar } from "./sideBarContext";

export function HamburgerButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={toggleSidebar}
      activeOpacity={0.75}
    >
      <View style={styles.line} />
      <View style={[styles.line, { width: 16 }]} />
      <View style={styles.line} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    gap: 5,
    padding: 8,
    marginLeft: Platform.OS === "ios" ? 4 : 0,
  },
  line: {
    width: 20,
    height: 2,
    backgroundColor: "#1A1A2E",
    borderRadius: 2,
  },
});
