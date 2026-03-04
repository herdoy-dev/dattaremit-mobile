import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import {
  useOnboardingStore,
  type OnboardingStep,
} from "@/store/onboarding-store";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";

const SEGMENT_TO_STEP: Record<string, OnboardingStep> = {
  referral: "referral",
  profile: "profile",
  address: "address",
  kyc: "kyc",
};

export default function OnboardingLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { step, isLoaded, canAccess } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (step === "completed") {
      const currentSegment = segments[1];
      if (currentSegment !== "kyc") {
        router.replace("/(tabs)" as never);
      }
      return;
    }

    const currentSegment = segments[1];
    const requiredStep = SEGMENT_TO_STEP[currentSegment as string];

    if (requiredStep && !canAccess(requiredStep)) {
      const correctRoute = ONBOARDING_STEP_ROUTES[step] || "/(onboarding)/profile";
      router.replace(correctRoute as never);
    }
  }, [isLoaded, step, segments, canAccess]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="referral" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="address" />
      <Stack.Screen name="kyc" />
    </Stack>
  );
}
