import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export function useAuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/welcome");
    }
  }, [isLoaded, isSignedIn]);

  return { isReady: isLoaded && isSignedIn };
}
