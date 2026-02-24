import "./global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import "react-native-reanimated";

import { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore, buildThemeVars } from "@/store/theme-store";
import { setAuthToken } from "@/lib/api-client";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ClerkTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthToken(getToken);
  }, [getToken]);
  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { colors } = useThemeStore();

  const themeVars = buildThemeVars(colors);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ClerkTokenSync />
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={[{ flex: 1 }, themeVars]}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(transfer)" />
                <Stack.Screen name="referral" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
