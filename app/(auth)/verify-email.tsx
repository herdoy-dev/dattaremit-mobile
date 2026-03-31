import { useState } from "react";
import { View, Text, TextInput, ImageBackground, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";
import { Button } from "@/components/ui/button";
import { useCodeInput } from "@/hooks/use-code-input";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { getClerkErrorMessage } from "@/lib/utils";
import { EMAIL_CODE_STRATEGY } from "@/constants/auth";

export default function VerifyEmailScreen() {
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const isSignIn = flow === "signin";

  const { routeAfterAuth } = usePostAuthRouting();
  const { signUp, setActive: setActiveSignUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: isSignInLoaded } = useSignIn();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = isSignIn ? isSignInLoaded : isSignUpLoaded;
  const displayEmail = isSignIn ? signIn?.identifier : signUp?.emailAddress;

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
      if (isSignIn) {
        const result = await signIn!.attemptFirstFactor({
          strategy: EMAIL_CODE_STRATEGY,
          code: verificationCode,
        });

        const sessionId = result.createdSessionId ?? signIn!.createdSessionId;
        if (result.status === "complete" && sessionId) {
          await setActiveSignIn!({ session: sessionId });
          await routeAfterAuth();
        } else {
          setError(`Verification incomplete (status: ${result.status}). Please try again.`);
        }
      } else {
        const result = await signUp!.attemptEmailAddressVerification({
          code: verificationCode,
        });

        const sessionId = result.createdSessionId ?? signUp!.createdSessionId;
        if (result.status === "complete" && sessionId) {
          await setActiveSignUp!({ session: sessionId });
          await routeAfterAuth();
        } else if (result.status === "missing_requirements") {
          try {
            await signUp!.update({
              firstName: signUp!.firstName || "User",
              lastName: signUp!.lastName || "User",
            });
            if (signUp!.status === "complete" && signUp!.createdSessionId) {
              await setActiveSignUp!({ session: signUp!.createdSessionId });
              await routeAfterAuth();
            } else {
              setError("Sign-up could not be completed. Please try again.");
            }
          } catch {
            setError("Sign-up could not be completed. Please try again.");
          }
        } else {
          setError(`Verification incomplete (status: ${result.status}). Please try again.`);
        }
      }
    } catch (err: unknown) {
      Sentry.captureException(err);
      setError(getClerkErrorMessage(err, "Invalid verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const codeInput = useCodeInput({ onComplete: handleVerify });

  const handleResend = async () => {
    if (!isLoaded || codeInput.resending || codeInput.cooldownSeconds > 0) return;

    codeInput.startCooldown();
    codeInput.setResending(true);
    setError(null);

    try {
      if (isSignIn) {
        const emailFactor = signIn!.supportedFirstFactors?.find(
          (f: { strategy: string }) => f.strategy === EMAIL_CODE_STRATEGY,
        );
        if (emailFactor) {
          await signIn!.prepareFirstFactor({
            strategy: EMAIL_CODE_STRATEGY,
            emailAddressId: (emailFactor as { emailAddressId: string }).emailAddressId,
          });
        }
      } else {
        await signUp!.prepareEmailAddressVerification({ strategy: EMAIL_CODE_STRATEGY });
      }
    } catch (err: unknown) {
      Sentry.captureException(err);
      setError(getClerkErrorMessage(err, "Failed to resend code. Please try again."));
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
          <Text className="mb-2 text-center text-2xl font-bold text-white">Verify Your Email</Text>
          <Text className="mb-8 text-center text-base text-white/70">
            We&apos;ve sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-white">{displayEmail || "your email"}</Text>
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
              accessibilityLabel={`Verification code digit ${index + 1}`}
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
            title="Verify"
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
