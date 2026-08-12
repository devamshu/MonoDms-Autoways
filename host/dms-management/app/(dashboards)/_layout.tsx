import { Stack } from "expo-router";

export default function DashboardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="crm" options={{ headerShown: false }} />
      <Stack.Screen name="logistic" options={{ headerShown: false }} />
      <Stack.Screen name="dealer" options={{ headerShown: false }} />
      <Stack.Screen name="sparepart" options={{ headerShown: false }} />
      <Stack.Screen name="service" options={{ headerShown: false }} />
    </Stack>
  );
}
