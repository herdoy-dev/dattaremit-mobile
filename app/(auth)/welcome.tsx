import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Shield, ArrowRight, Wallet } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";

export default function WelcomeScreen() {
  const router = useRouter();
  const { advanceStep } = useOnboardingStore();
  const { primary } = useThemeColors();

  const handleLogin = async () => {
    await advanceStep();
    router.push("/(auth)/login");
  };

  const handleRegister = async () => {
    await advanceStep();
    router.push("/(auth)/register");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 justify-between px-6 pb-8 pt-12">
        {/* Hero Section */}
        <View className="flex-1 items-center justify-center">
          <Animated.View
            entering={FadeInDown.delay(200).duration(800).springify()}
            className="mb-8 h-28 w-28 items-center justify-center rounded-3xl"
            style={{ backgroundColor: hexToRgba(primary, 0.1) }}
          >
            <Wallet size={56} color={primary} />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(800).springify()}
            className="mb-3 text-center text-4xl font-bold text-light-text dark:text-dark-text"
          >
            DattaRemit
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(600).duration(800).springify()}
            className="mb-10 text-center text-lg leading-7 text-light-text-secondary dark:text-dark-text-secondary"
          >
            Send money globally with{"\n"}confidence and ease
          </Animated.Text>

          {/* Feature Highlights */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(800).springify()}
            className="w-full gap-4"
          >
            <FeatureItem
              icon={<Shield size={22} color={primary} />}
              title="Bank-Level Security"
              description="Your transactions are protected with end-to-end encryption"
            />
            <FeatureItem
              icon={<ArrowRight size={22} color={primary} />}
              title="Instant Transfers"
              description="Send money across borders in minutes, not days"
            />
            <FeatureItem
              icon={<Wallet size={22} color={primary} />}
              title="Low Fees"
              description="Competitive rates with no hidden charges"
            />
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(800).springify()}
          className="gap-3"
        >
          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="lg"
          />
          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="outline"
            size="lg"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const { primary } = useThemeColors();
  return (
    <View className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface">
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: hexToRgba(primary, 0.1) }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-light-text dark:text-dark-text">
          {title}
        </Text>
        <Text className="mt-0.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}
