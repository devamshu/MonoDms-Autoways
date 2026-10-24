import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { TamaguiProvider, Theme, useTheme } from "tamagui";

import { SlideOpenProvider } from '@/components/auth/slideOpen';
import { ToastProvider } from '@/components/auth/toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import config from '../tamagui.config';
import { resetAuth } from './features/auth/store/auth.slice';
import { useAppDispatch } from './features/hooks';
import { persistor, store } from './features/store';
import { setApiAuthFailureHandler } from './services/axios';
import { AppRoutes, navigate } from './utils/navigation';

export const unstable_settings = {
  initialRouteName: "index",
};

// React Navigation paints every scene with its own theme background underneath
// the screen. Its DarkTheme background is rgb(1,1,1), so any screen that does
// not paint its own surface showed through as pure black instead of the
// Tamagui one. Feed the Tamagui palette in so the two can't disagree.
function NavigationTheme({
  children,
  scheme,
}: {
  children: ReactNode;
  scheme: "light" | "dark";
}) {
  const theme = useTheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  const value = useMemo(
    () => ({
      ...base,
      colors: {
        ...base.colors,
        background: theme.background?.val ?? base.colors.background,
        card: theme.background?.val ?? base.colors.card,
        text: theme.color?.val ?? base.colors.text,
        border: theme.background?.val ?? base.colors.border,
        primary: theme.primary?.val ?? base.colors.primary,
      },
    }),
    [base, theme],
  );

  return <ThemeProvider value={value}>{children}</ThemeProvider>;
}

function AppContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setApiAuthFailureHandler(async () => {
      try {
        await persistor.purge();
      } catch (error) {
        console.error('[Auth] Failed to purge persistor:', error);
      }

      dispatch(resetAuth());

      try {
        navigate.replace(AppRoutes.LOGIN);
      } catch (error) {
        console.error('[Auth] Failed to navigate to login:', error);
      }
    });
  }, [dispatch]);

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme ?? "light"}>
      <ToastProvider>
        <SlideOpenProvider>
          <Theme name={colorScheme ?? "light"}>
            <NavigationTheme scheme={colorScheme === "dark" ? "dark" : "light"}>
              <Slot />
              <StatusBar style="auto" />
            </NavigationTheme>
          </Theme>
        </SlideOpenProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    // Must sit above TamaguiProvider: TamaguiProvider mounts the root PortalHost,
    // and `modal` Sheets teleport their contents into it. Anything using
    // GestureDetector inside a Sheet inherits the host's context chain, so the
    // gesture root has to be an ancestor of the host, not of the call site.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
