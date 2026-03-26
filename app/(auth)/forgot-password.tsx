import { useState, useRef } from "react";
import { View, Text, TextInput, ImageBackground, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Mail, ArrowLeft, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { emailSchema, passwordSchema } from "@/lib/schemas";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import { VERIFICATION_CODE_LENGTH, RESEND_COOLDOWN_SECONDS } from "@/constants/limits";
import * as Sentry from "@sentry/react-native";

const CODE_LENGTH = VERIFICATION_CODE_LENGTH;

type Step = "email" | "code";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { routeAfterAuth } = usePostAuthRouting();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [authError, setAuthError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // OTP state
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const emailForm = useForm({ email: "" }, z.object({ email: emailSchema }));

  const passwordForm = useForm(
    { password: "", confirmPassword: "" },
    z
      .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  );

  // Cooldown timer
  useState(() => {
    const interval = setInterval(() => {
      setCooldownSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setCodeError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

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

  const handleResendCode = async () => {
    if (!isLoaded || resending || cooldownSeconds > 0) return;
    setResending(true);
    setAuthError(null);
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailForm.values.email,
      });
      setCode(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch (err: unknown) {
      Sentry.captureException(err);
      setAuthError(getClerkErrorMessage(err, "Could not resend code. Please try again."));
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    const codeValue = code.join("");
    if (codeValue.length !== CODE_LENGTH) {
      setCodeError("Please enter the full 6-digit code");
      return;
    }
    if (!passwordForm.validate() || !isLoaded || !signIn) return;
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: codeValue,
        password: passwordForm.values.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await routeAfterAuth();
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
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="flex-grow pb-16"
          keyboardShouldPersistTaps="handled"
        >
          <Button
            title=""
            onPress={() => {
              if (step === "code") {
                setStep("email");
                setAuthError(null);
                setCodeError(null);
                setCode(Array(CODE_LENGTH).fill(""));
              } else {
                router.back();
              }
            }}
            variant="ghost"
            size="sm"
            className="mt-2 self-start"
            icon={<ArrowLeft size={24} color={COLORS.white} />}
          />

          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            className="mt-8"
          >
            <Text className="text-2xl font-bold text-white">Reset Password</Text>
            <Text className="mt-2 text-base text-white/70">
              {step === "email"
                ? "Enter your email and we'll send you a reset code."
                : "Enter the code sent to your email and set a new password."}
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
              className="mt-8 gap-5"
            >
              <View className="rounded-xl bg-white/10 p-4">
                <Text className="text-center text-base text-white">
                  A reset code has been sent to{" "}
                  <Text className="font-semibold">{emailForm.values.email}</Text>
                </Text>
              </View>

              {/* OTP Code Input */}
              <View>
                <Text className="mb-3 text-sm font-medium text-white">Reset Code</Text>
                <View className="flex-row justify-center gap-3">
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      className="h-14 w-12 rounded-xl border-2 border-white/30 bg-white/10 text-center text-xl font-bold text-white"
                      accessibilityLabel={`Reset code digit ${index + 1}`}
                    />
                  ))}
                </View>
                {codeError && (
                  <Text className="mt-2 text-center text-sm text-red-400">{codeError}</Text>
                )}
              </View>

              <Input
                label="New Password"
                value={passwordForm.values.password}
                onChangeText={(t) => passwordForm.setValue("password", t)}
                placeholder="Enter new password"
                secureTextEntry
                error={passwordForm.errors.password}
                icon={<Lock size={20} color={COLORS.placeholder} />}
                labelClassName="text-white"
                inputClassName="text-white"
                textColor={COLORS.white}
              />

              <Input
                label="Confirm Password"
                value={passwordForm.values.confirmPassword}
                onChangeText={(t) => passwordForm.setValue("confirmPassword", t)}
                placeholder="Re-enter new password"
                secureTextEntry
                error={passwordForm.errors.confirmPassword}
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

              <View className="flex-row items-center justify-center">
                <Text className="text-sm text-white/70">Didn&apos;t receive the code? </Text>
                <Pressable onPress={handleResendCode} disabled={resending || cooldownSeconds > 0}>
                  <Text className="text-sm font-semibold text-white">
                    {cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : resending
                        ? "Sending..."
                        : "Resend"}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
