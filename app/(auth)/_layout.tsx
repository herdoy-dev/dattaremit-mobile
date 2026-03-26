import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { routeAfterAuth } = usePostAuthRouting();
  const { primary } = useThemeColors();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasRedirected.current) {
      hasRedirected.current = true;
      routeAfterAuth();
    }
  }, [isLoaded, isSignedIn, routeAfterAuth]);

  if (!isLoaded || isSignedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
