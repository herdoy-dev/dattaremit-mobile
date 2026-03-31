import { useState } from "react";
import { View, Text, TextInput, ImageBackground, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useCodeInput } from "@/hooks/use-code-input";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import * as Sentry from "@sentry/react-native";

export default function ResetCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn, isLoaded } = useSignIn();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (verificationCode: string) => {
    if (!isLoaded) return;

    if (codeInput.tooManyAttempts) {
      setError("Too many attempts. Please request a new code.");
      return;
    }
    codeInput.setAttempts((a) => a + 1);
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode,
      });

      if (result.status === "needs_new_password") {
        router.replace({
          pathname: "/(auth)/new-password",
          params: { email },
        });
      }
    } catch (err: unknown) {
      Sentry.captureException(err);
      setError(getClerkErrorMessage(err, "Invalid code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const codeInput = useCodeInput({ onComplete: handleVerify });

  const handleResend = async () => {
    if (!isLoaded || codeInput.resending || codeInput.cooldownSeconds > 0) return;
    codeInput.setResending(true);
    setError(null);
    codeInput.startCooldown();

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      codeInput.resetCode();
    } catch (err: unknown) {
      Sentry.captureException(err);
      setError(getClerkErrorMessage(err, "Could not resend code. Please try again."));
    } finally {
      codeInput.setResending(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/welcome.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 justify-center px-6">
        <Button
          title=""
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          className="absolute left-6 top-14 z-10"
          icon={<ArrowLeft size={24} color={COLORS.white} />}
        />

        <Animated.Image
          entering={FadeInDown.delay(100).duration(600).springify()}
          source={require("@/assets/images/logo.png")}
          className="mb-6 h-28 w-28 self-center"
          resizeMode="contain"
          accessibilityLabel="DattaRemit logo"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="items-center"
        >
          <Text className="mb-2 text-center text-2xl font-bold text-white">Enter Reset Code</Text>
          <Text className="mb-8 text-center text-base text-white/70">
            We&apos;ve sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-white">{email || "your email"}</Text>
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="mb-6 flex-row justify-center gap-3"
        >
          {codeInput.code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                codeInput.inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => {
                setError(null);
                codeInput.handleChange(text, index);
              }}
              onKeyPress={({ nativeEvent }) => codeInput.handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              className="h-14 w-12 rounded-xl border-2 border-white/30 bg-white/10 text-center text-xl font-bold text-white"
              accessibilityLabel={`Reset code digit ${index + 1}`}
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

        <Animated.View entering={FadeInDown.delay(600).duration(600).springify()} className="gap-4">
          <Button
            title="Verify Code"
            onPress={() => handleVerify(codeInput.code.join(""))}
            loading={loading}
            disabled={!codeInput.isComplete || loading}
            size="lg"
          />

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-white/70">Didn&apos;t receive the code? </Text>
            <Pressable
              onPress={handleResend}
              disabled={codeInput.resending || codeInput.cooldownSeconds > 0}
            >
              <Text className="text-sm font-semibold text-white">
                {codeInput.cooldownSeconds > 0
                  ? `Resend in ${codeInput.cooldownSeconds}s`
                  : codeInput.resending
                    ? "Sending..."
                    : "Resend"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}
