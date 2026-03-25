import { useEffect, useState } from "react";
import { View, Pressable, Text } from "react-native";
import { Stack, useSegments, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { useOnboardingStore, type OnboardingStep } from "@/store/onboarding-store";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";
import { typedReplace } from "@/lib/navigation";
import { COLORS } from "@/constants/theme";

const SEGMENT_TO_STEP: Record<string, OnboardingStep> = {
  referral: "referral",
  profile: "profile",
  address: "address",
  kyc: "kyc",
};

export default function OnboardingLayout() {
  const segments = useSegments() as string[];
  const router = useRouter();
  const { step, isLoaded, canAccess, resetOnboarding } = useOnboardingStore();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    await resetOnboarding();
    queryClient.clear();
    router.replace("/(auth)/welcome");
  };

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
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
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

      <SafeAreaView edges={["bottom"]} className="bg-light-bg dark:bg-dark-bg">
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          className="flex-row items-center justify-center gap-2 py-4"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={{ opacity: signingOut ? 0.5 : 1 }}
        >
          <LogOut size={16} color={COLORS.error} />
          <Text className="text-sm font-medium" style={{ color: COLORS.error }}>
            Sign Out
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
