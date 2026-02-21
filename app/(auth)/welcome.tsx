import { View, Text, ImageBackground } from "react-native";
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
    <ImageBackground
      source={require("@/assets/images/welcome.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between px-6 pb-8 pt-12">
          <View className="flex-1 items-center justify-start">
            <Animated.Image
              entering={FadeInDown.delay(200).duration(800).springify()}
              source={require("@/assets/images/logo.png")}
              className="-mb-3 h-44 w-44"
              resizeMode="contain"
            />

            <Animated.Text
              entering={FadeInDown.delay(400).duration(800).springify()}
              className="mb-3 text-center text-4xl font-bold text-white"
            >
              DattaRemit
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(600).duration(800).springify()}
              className="mb-10 text-center text-lg leading-6 text-white/70"
            >
              Send money globally with confidence
            </Animated.Text>
          </View>

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
    </ImageBackground>
  );
}
