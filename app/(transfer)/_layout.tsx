import { Stack } from "expo-router";
import { useOnboardingGuard } from "@/hooks/use-onboarding-guard";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function TransferLayout() {
  const { isReady } = useAuthGuard();
  useOnboardingGuard();

  if (!isReady) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="send" />
      <Stack.Screen name="add-bank" />
      <Stack.Screen name="add-recipient" />
      <Stack.Screen name="recipient-bank" />
    </Stack>
  );
}
