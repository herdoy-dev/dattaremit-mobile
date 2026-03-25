import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { routeAfterAuth } = usePostAuthRouting();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasRedirected.current) {
      hasRedirected.current = true;
      routeAfterAuth();
    }
  }, [isLoaded, isSignedIn, routeAfterAuth]);

  if (!isLoaded || isSignedIn) {
    return null;
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
