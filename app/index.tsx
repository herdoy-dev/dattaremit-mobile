import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function IndexScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { step, isLoaded: isOnboardingLoaded } = useOnboardingStore();
  const { primary } = useThemeColors();

  useEffect(() => {
    if (!isClerkLoaded || !isOnboardingLoaded) return;

    if (!isSignedIn) {
      router.replace("/(auth)/welcome");
      return;
    }

    const routes: Record<string, string> = {
      welcome: "/(onboarding)/profile",
      auth: "/(onboarding)/profile",
      profile: "/(onboarding)/profile",
      address: "/(onboarding)/address",
      kyc: "/(onboarding)/kyc",
      completed: "/(tabs)",
    };

    const target = routes[step] || "/(onboarding)/profile";
    router.replace(target as never);
  }, [isClerkLoaded, isOnboardingLoaded, isSignedIn, step, router]);

  return (
    <View className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
      <ActivityIndicator size="large" color={primary} />
    </View>
  );
}
