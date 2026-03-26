import { useState } from "react";
import { View, Text, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Mail, ArrowLeft, Lock, KeyRound } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { emailSchema, passwordSchema } from "@/lib/schemas";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import * as Sentry from "@sentry/react-native";

type Step = "email" | "code";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [authError, setAuthError] = useState<string | null>(null);

  const emailForm = useForm({ email: "" }, z.object({ email: emailSchema }));

  const resetForm = useForm(
    { code: "", password: "" },
    z.object({
      code: z.string().min(1, "Code is required").min(6, "Code must be 6 digits"),
      password: passwordSchema,
    }),
  );

  const handleSendCode = async () => {
    if (!emailForm.validate() || !isLoaded) return;
    setLoading(true);
    setAuthError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailForm.values.email,
      });
      setStep("code");
    } catch (err: unknown) {
      Sentry.captureException(err);
      setAuthError(getClerkErrorMessage(err, "Could not send reset email. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.validate() || !isLoaded || !signIn) return;
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetForm.values.code,
        password: resetForm.values.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      Sentry.captureException(err);
      setAuthError(getClerkErrorMessage(err, "Could not reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/welcome.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 px-6">
        <Button
          title=""
          onPress={() => {
            if (step === "code") {
              setStep("email");
              setAuthError(null);
            } else {
              router.back();
            }
          }}
          variant="ghost"
          size="sm"
          className="mt-2 self-start"
          icon={<ArrowLeft size={24} color={COLORS.white} />}
        />

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mt-8">
          <Text className="text-2xl font-bold text-white">Reset Password</Text>
          <Text className="mt-2 text-base text-white/70">
            {step === "email"
              ? "Enter your email and we'll send you a reset code."
              : "Enter the code sent to your email and your new password."}
          </Text>
        </Animated.View>

        {step === "email" ? (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="mt-8 gap-4"
          >
            <Input
              label="Email"
              value={emailForm.values.email}
              onChangeText={(t) => emailForm.setValue("email", t)}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={emailForm.errors.email}
              icon={<Mail size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
              textColor={COLORS.white}
            />

            {authError && <ErrorBanner message={authError} />}

            <Button
              title="Send Reset Code"
              onPress={handleSendCode}
              loading={loading}
              disabled={loading}
              size="lg"
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            className="mt-8 gap-4"
          >
            <View className="rounded-xl bg-white/10 p-4">
              <Text className="text-center text-base text-white">
                A reset code has been sent to{" "}
                <Text className="font-semibold">{emailForm.values.email}</Text>
              </Text>
            </View>

            <Input
              label="Reset Code"
              value={resetForm.values.code}
              onChangeText={(t) => resetForm.setValue("code", t)}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              error={resetForm.errors.code}
              icon={<KeyRound size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
              textColor={COLORS.white}
            />

            <Input
              label="New Password"
              value={resetForm.values.password}
              onChangeText={(t) => resetForm.setValue("password", t)}
              placeholder="Enter new password"
              secureTextEntry
              error={resetForm.errors.password}
              icon={<Lock size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
              textColor={COLORS.white}
            />

            {authError && <ErrorBanner message={authError} />}

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              size="lg"
            />

            <Button
              title="Resend Code"
              onPress={handleSendCode}
              variant="ghost"
              size="sm"
              className="self-center"
            />
          </Animated.View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
