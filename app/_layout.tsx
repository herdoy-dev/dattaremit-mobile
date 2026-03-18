import "./global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import "react-native-reanimated";

import { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore, buildThemeVars } from "@/store/theme-store";
import { setAuthToken } from "@/lib/api-client";
import { AppErrorFallback } from "@/components/ui/app-error-fallback";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  environment: __DEV__ ? "development" : "production",
  debug: __DEV__,

  tracesSampleRate: __DEV__ ? 1.0 : 1.0,
  profilesSampleRate: __DEV__ ? 0.5 : 0.5,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: __DEV__ ? 0.0 : 0.1,

  integrations: [
    Sentry.reactNavigationIntegration({
      enableTimeToInitialDisplay: true,
    }),
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
  ],

  sendDefaultPii: true,
  attachScreenshot: true,
  enableAutoSessionTracking: true,

  beforeSend(event, hint) {
    const msg = (hint.originalException as Error)?.message ?? "";
    if (/User cancelled|AbortError/.test(msg)) return null;
    return event;
  },
  ignoreErrors: ["Non-Error promise rejection captured"],
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      Sentry.captureException(error, {
        tags: { source: "react-query", queryKey: JSON.stringify(query.queryKey) },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { source: "react-query-mutation" },
      });
    },
  }),
});

function ClerkTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthToken(getToken);
  }, [getToken]);
  return null;
}

function SentryUserSync() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    if (isSignedIn && userId) {
      Sentry.setUser({
        id: userId,
        email: user?.primaryEmailAddress?.emailAddress,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [isSignedIn, userId, user]);
  return null;
}

function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { colors } = useThemeStore();
  const themeVars = buildThemeVars(colors);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ClerkTokenSync />
        <SentryUserSync />
        <QueryClientProvider client={queryClient}>
          <Sentry.ErrorBoundary
            fallback={({ resetError }) => (
              <AppErrorFallback onReset={resetError} />
            )}
            beforeCapture={(scope) => {
              scope.setTag("boundary", "root");
            }}
          >
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
          </Sentry.ErrorBoundary>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
