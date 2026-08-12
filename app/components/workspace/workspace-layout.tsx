import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import { ReactNode } from "react";
import { Platform } from "react-native";
import { useTheme } from "tamagui";

export type WorkspaceTabItem = {
  name: string;
  title: string;
  icon: (color: string) => ReactNode;
};

type WorkspaceTabsLayoutProps = {
  tabs: WorkspaceTabItem[];
};

export function WorkspaceTabsLayout({ tabs }: WorkspaceTabsLayoutProps) {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme?.primary?.val,
        tabBarInactiveTintColor: theme?.placeholder?.val ?? theme?.secondaryText?.val,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 90,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 10,
          position: "absolute",
          ...Platform.select({
            ios: {
              shadowColor: theme?.black?.val,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
          gap: 6,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => tab.icon(color),
          }}
        />
      ))}
    </Tabs>
  );
}
