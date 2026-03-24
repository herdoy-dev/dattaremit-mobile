import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { useOnboardingStore, type OnboardingStep } from "@/store/onboarding-store";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";
import { typedReplace } from "@/lib/navigation";

const SEGMENT_TO_STEP: Record<string, OnboardingStep> = {
  referral: "referral",
  profile: "profile",
  address: "address",
  kyc: "kyc",
};

export default function OnboardingLayout() {
  const segments = useSegments() as string[];
  const router = useRouter();
  const { step, isLoaded, canAccess } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (step === "completed") {
      const currentSegment = segments[1];
      if (currentSegment !== "kyc") {
        typedReplace(router, "/(tabs)");
      }
      return;
    }

    const currentSegment = segments[1] as string | undefined;
    const requiredStep = currentSegment ? SEGMENT_TO_STEP[currentSegment] : undefined;

    if (requiredStep && !canAccess(requiredStep)) {
      const correctRoute = ONBOARDING_STEP_ROUTES[step] || "/(onboarding)/profile";
      typedReplace(router, correctRoute);
    }
  }, [isLoaded, step, segments, canAccess, router]);

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
