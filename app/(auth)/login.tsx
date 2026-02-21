import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Mail, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon, AppleIcon } from "@/components/icons/social-icons";
import { useOnboardingStore } from "@/store/onboarding-store";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string | null;
    password?: string | null;
  }>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    return !emailErr && !passErr;
  };

  const handleLogin = async () => {
    if (!validate() || !isLoaded) return;
    setLoadingAction("email");
    setAuthError(null);

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await setStep("profile");
        router.replace("/(onboarding)/profile");
      }
    } catch (err: any) {
      setAuthError(
        err?.errors?.[0]?.longMessage ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const { startSSOFlow } = useSSO();

  const handleSocialAuth = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setLoadingAction(strategy);
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
          err?.errors?.[0]?.longMessage ||
            "Social sign-in failed. Please try again.",
        );
      } finally {
        setLoadingAction(null);
      }
    },
    [startSSOFlow, setStep, router],
  );

  return (
    <ImageBackground
      source={require("@/assets/images/welcome.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-16"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.Image
            entering={FadeInDown.delay(100).duration(600).springify()}
            source={require("@/assets/images/logo.png")}
            className="mb-6 mt-8 h-28 w-28 self-center"
            resizeMode="contain"
          />

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
              labelClassName="text-white"
              inputClassName="text-white"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password)
                  setErrors((e) => ({ ...e, password: null }));
              }}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={20} color="#9CA3AF" />}
              labelClassName="text-white"
              inputClassName="text-white"
            />

            {authError && (
              <View className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                <Text className="text-sm text-red-600 dark:text-red-400">
                  {authError}
                </Text>
              </View>
            )}

            <Button
              title="Forgot Password?"
              onPress={() => {}}
              variant="ghost"
              size="sm"
              className="self-end h-auto px-0"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loadingAction === "email"}
              disabled={!!loadingAction}
              size="lg"
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            className="my-8 flex-row items-center"
          >
            <View className="h-px flex-1 bg-white/20" />
            <Text className="mx-4 text-sm text-white/50">
              Or continue with
            </Text>
            <View className="h-px flex-1 bg-white/20" />
          </Animated.View>

          {/* Social Auth */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600).springify()}
            className="gap-3"
          >
            <Button
              title="Continue with Google"
              onPress={() => handleSocialAuth("oauth_google")}
              variant="outline"
              size="lg"
              icon={<GoogleIcon />}
              loading={loadingAction === "oauth_google"}
              disabled={!!loadingAction}
            />
            <Button
              title="Continue with Apple"
              onPress={() => handleSocialAuth("oauth_apple")}
              variant="outline"
              size="lg"
              icon={<AppleIcon color="#FFFFFF" />}
              loading={loadingAction === "oauth_apple"}
              disabled={!!loadingAction}
            />
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600).springify()}
            className="mt-8 flex-row justify-center"
          >
            <Text className="text-sm text-white/70">
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.replace("/(auth)/register")}>
              <Text className="text-sm font-semibold text-white">Sign Up</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
