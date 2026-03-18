import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  useNavigationContainerRef,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "./global.css";

import { AppErrorFallback } from "@/components/ui/app-error-fallback";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setAuthToken } from "@/lib/api-client";
import { buildThemeVars, useThemeStore } from "@/store/theme-store";
import { useEffect } from "react";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  enableLogs: true,

  environment: __DEV__ ? "development" : "production",
  debug: __DEV__,

  tracesSampleRate: __DEV__ ? 1.0 : 1.0,
  profilesSampleRate: __DEV__ ? 0.5 : 0.5,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: __DEV__ ? 0.0 : 0.1,

  integrations: [
    navigationIntegration,
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
  const ref = useNavigationContainerRef();
  const { colorScheme } = useColorScheme();
  const { colors } = useThemeStore();
  const themeVars = buildThemeVars(colors);

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

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
