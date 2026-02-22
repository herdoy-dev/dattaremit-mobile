import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { resolveOnboardingStep } from "@/lib/utils";
import { onboardingService } from "@/services/onboarding";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const isSignIn = flow === "signin";

  const { setStep } = useOnboardingStore();
  const { signUp, setActive: setActiveSignUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: isSignInLoaded } = useSignIn();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputs = useRef<(TextInput | null)[]>([]);

  const isLoaded = isSignIn ? isSignInLoaded : isSignUpLoaded;
  const displayEmail = isSignIn
    ? signIn?.identifier
    : signUp?.emailAddress;

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && index === CODE_LENGTH - 1 && newCode.every((d) => d)) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  const routeAfterVerification = async () => {
    try {
      const accountData = await onboardingService.getAccountStatus();
      const step = resolveOnboardingStep(accountData);
      await setStep(step);
      const routes: Record<string, string> = {
        profile: "/(onboarding)/profile",
        address: "/(onboarding)/address",
        kyc: "/(onboarding)/kyc",
        completed: "/(tabs)",
      };
      router.replace((routes[step] || "/(onboarding)/profile") as never);
    } catch {
      await setStep("profile");
      router.replace("/(onboarding)/profile");
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const finalCode = verificationCode || code.join("");
    if (finalCode.length !== CODE_LENGTH || !isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      if (isSignIn) {
        const result = await signIn!.attemptFirstFactor({
          strategy: "email_code",
          code: finalCode,
        });

        if (result.status === "complete" && result.createdSessionId) {
          await setActiveSignIn({ session: result.createdSessionId });
          await routeAfterVerification();
        }
      } else {
        const result = await signUp!.attemptEmailAddressVerification({
          code: finalCode,
        });

        if (result.status === "complete" && result.createdSessionId) {
          await setActiveSignUp({ session: result.createdSessionId });
          await routeAfterVerification();
        }
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          "Invalid verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || resending) return;

    setResending(true);
    setError(null);

    try {
      if (isSignIn) {
        const emailFactor = signIn!.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        );
        if (emailFactor) {
          await signIn!.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: (emailFactor as any).emailAddressId,
          });
        }
      } else {
        await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          "Failed to resend code. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/welcome.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 justify-center px-6">
        {/* Logo */}
        <Animated.Image
          entering={FadeInDown.delay(100).duration(600).springify()}
          source={require("@/assets/images/logo.png")}
          className="mb-6 h-28 w-28 self-center"
          resizeMode="contain"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="items-center"
        >
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            Verify Your Email
          </Text>
          <Text className="mb-8 text-center text-base text-white/70">
            We've sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-white">
              {displayEmail || "your email"}
            </Text>
          </Text>
        </Animated.View>

        {/* Code Inputs */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="mb-6 flex-row justify-center gap-3"
        >
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              className="h-14 w-12 rounded-xl border-2 border-white/30 bg-white/10 text-center text-xl font-bold text-white"
            />
          ))}
        </Animated.View>

        {error && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="mb-4 rounded-xl bg-red-500/20 p-3"
          >
            <Text className="text-center text-sm text-red-300">{error}</Text>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(600).duration(600).springify()}
          className="gap-4"
        >
          <Button
            title="Verify"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={code.some((d) => !d) || loading}
            size="lg"
          />

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-white/70">
              Didn't receive the code?{" "}
            </Text>
            <Pressable onPress={handleResend} disabled={resending}>
              <Text className="text-sm font-semibold text-white">
                {resending ? "Sending..." : "Resend"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}
