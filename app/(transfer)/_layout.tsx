import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboarding-store";

const STEP_ROUTES: Record<string, string> = {
  welcome: "/(onboarding)/profile",
  auth: "/(onboarding)/profile",
  profile: "/(onboarding)/profile",
  address: "/(onboarding)/address",
  kyc: "/(onboarding)/kyc",
};

export default function TransferLayout() {
  const router = useRouter();
  const { step, isLoaded } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded) return;
    if (step !== "completed") {
      const route = STEP_ROUTES[step] || "/(onboarding)/profile";
      router.replace(route as never);
    }
  }, [isLoaded, step]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="send" />
      <Stack.Screen name="receive" />
      <Stack.Screen name="add-bank" />
    </Stack>
  );
}
