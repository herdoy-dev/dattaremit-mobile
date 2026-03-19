import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import type { AccountStatus } from "@/types/api";

interface KycGateViewProps {
  accountStatus: AccountStatus;
  primary: string;
}

export function KycGateView({ accountStatus, primary }: KycGateViewProps) {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      className="items-center gap-5 pt-8"
    >
      <View
        className="h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primary}15` }}
      >
        <ShieldCheck size={36} color={primary} />
      </View>

      <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
        Verify Your Identity
      </Text>

      <Text className="text-light-muted dark:text-dark-muted px-4 text-center text-base leading-6">
        {accountStatus === "PENDING"
          ? "Your KYC verification is being reviewed. You'll be able to connect your bank account once it's approved."
          : "Complete your KYC verification to connect your bank account."}
      </Text>

      {accountStatus !== "PENDING" && (
        <Button
          title="Complete KYC"
          onPress={() => router.push("/(onboarding)/kyc")}
          size="lg"
          className="mt-4 w-full"
        />
      )}
    </Animated.View>
  );
}
