import { Stack } from "expo-router";
import { useOnboardingGuard } from "@/hooks/use-onboarding-guard";

export default function TransferLayout() {
  useOnboardingGuard();

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
