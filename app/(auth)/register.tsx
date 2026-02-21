import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon, AppleIcon } from "@/components/icons/social-icons";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

export default function RegisterScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { primary } = useThemeColors();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    setErrors({
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr,
    });
    return !emailErr && !passErr && !confirmErr;
  };

  const handleRegister = async () => {
    if (!validate() || !isLoaded) return;
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signUp.create({ emailAddress: email, password });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await setStep("profile");
        router.replace("/(onboarding)/profile");
      }
    } catch (err: any) {
      setAuthError(
        err?.errors?.[0]?.longMessage || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { startSSOFlow } = useSSO();

  const handleSocialAuth = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setIsLoading(true);
      setAuthError(null);

      try {
        const { createdSessionId, setActive: ssoSetActive } =
          await startSSOFlow({ strategy });

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId });
          await setStep("profile");
          router.replace("/(onboarding)/profile");
        }
      } catch (err: any) {
        setAuthError(
          err?.errors?.[0]?.longMessage || "Social sign-up failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [startSSOFlow, setStep, router]
  );

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8 mt-2 flex-row items-center">
          <Button
            icon={<ArrowLeft size={22} color={primary} />}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
            className="mr-4 h-11 w-11 rounded-xl bg-light-surface px-0 dark:bg-dark-surface"
          />
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            Create Account
          </Text>
        </View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="gap-4"
        >
          <Input
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: null }));
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
            icon={<Mail size={20} color="#9CA3AF" />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: null }));
            }}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            icon={<Lock size={20} color="#9CA3AF" />}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword)
                setErrors((e) => ({ ...e, confirmPassword: null }));
            }}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            icon={<ShieldCheck size={20} color="#9CA3AF" />}
          />

          {authError && (
            <View className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
              <Text className="text-sm text-red-600 dark:text-red-400">
                {authError}
              </Text>
            </View>
          )}

          {/* Password Requirements */}
          <View className="rounded-xl bg-light-surface p-3 dark:bg-dark-surface">
            <Text className="mb-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Password must contain:
            </Text>
            <PasswordRequirement
              met={password.length >= 8}
              text="At least 8 characters"
            />
            <PasswordRequirement
              met={/[A-Z]/.test(password)}
              text="One uppercase letter"
            />
            <PasswordRequirement
              met={/[0-9]/.test(password)}
              text="One number"
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            size="lg"
          />
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="my-8 flex-row items-center"
        >
          <View className="h-px flex-1 bg-light-border dark:bg-dark-border" />
          <Text className="mx-4 text-sm text-light-text-muted dark:text-dark-text-muted">
            Or continue with
          </Text>
          <View className="h-px flex-1 bg-light-border dark:bg-dark-border" />
        </Animated.View>

        {/* Social Auth */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600).springify()}
          className="gap-3"
        >
          <Button
            title="Continue with Google"
            onPress={() => handleSocialAuth("oauth_google")}
            variant="secondary"
            size="lg"
            icon={<GoogleIcon />}
          />
          <Button
            title="Continue with Apple"
            onPress={() => handleSocialAuth("oauth_apple")}
            variant="secondary"
            size="lg"
            icon={<AppleIcon />}
          />
        </Animated.View>

        {/* Login Link */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600).springify()}
          className="mt-8 flex-row justify-center"
        >
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-sm font-semibold text-primary">Sign In</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View className="mb-1 flex-row items-center">
      <View
        className={`mr-2 h-1.5 w-1.5 rounded-full ${met ? "bg-green-500" : "bg-light-text-muted dark:bg-dark-text-muted"}`}
      />
      <Text
        className={`text-xs ${met ? "text-green-600 dark:text-green-400" : "text-light-text-muted dark:text-dark-text-muted"}`}
      >
        {text}
      </Text>
    </View>
  );
}
