import { Stack } from "expo-router";

export default function OrderLayout() {
  return (
    <Stack>
      <Stack.Screen name="order-parts" options={{ headerShown: false }} />
      <Stack.Screen name="scan-order" options={{ headerShown: false }} />
    </Stack>
  );
}
