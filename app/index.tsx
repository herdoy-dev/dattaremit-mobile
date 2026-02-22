import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { onboardingService } from "@/services/onboarding";
import { resolveOnboardingStep } from "@/lib/utils";

export default function IndexScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { step, isLoaded: isOnboardingLoaded, setStep } = useOnboardingStore();
  const { primary } = useThemeColors();

  useEffect(() => {
    if (!isClerkLoaded || !isOnboardingLoaded) return;

    if (!isSignedIn) {
      router.replace("/(auth)/welcome");
      return;
    }

    // Sync onboarding state with server
    onboardingService
      .getAccountStatus()
      .then(async (accountData) => {
        const serverStep = resolveOnboardingStep(accountData);
        await setStep(serverStep);

        const routes: Record<string, string> = {
          welcome: "/(onboarding)/profile",
          auth: "/(onboarding)/profile",
          profile: "/(onboarding)/profile",
          address: "/(onboarding)/address",
          kyc: "/(onboarding)/kyc",
          completed: "/(tabs)",
        };

        const target = routes[serverStep] || "/(onboarding)/profile";
        router.replace(target as never);
      })
      .catch(() => {
        // Fallback to local step if server check fails
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
      });
  }, [isClerkLoaded, isOnboardingLoaded, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
      <ActivityIndicator size="large" color={primary} />
    </View>
  );
}
