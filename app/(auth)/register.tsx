import { View, Text, Pressable, ScrollView, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignUp } from "@clerk/clerk-expo";
import { Mail, Lock, ShieldCheck } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { GoogleIcon, AppleIcon } from "@/components/icons/social-icons";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useForm } from "@/hooks/use-form";
import { useSocialAuth } from "@/hooks/use-social-auth";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";
import { resolveOnboardingStep } from "@/lib/utils";
import { onboardingService } from "@/services/onboarding";
import { COLORS } from "@/constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { signUp, setActive, isLoaded } = useSignUp();

  const { values, errors, setValue, validate } = useForm(
    { email: "", password: "", confirmPassword: "" },
    {
      email: (v) => validateEmail(v),
      password: (v) => validatePassword(v),
      confirmPassword: (v, all) => validateConfirmPassword(all.password, v),
    }
  );

  const {
    handleSocialAuth,
    loadingAction,
    setLoadingAction,
    authError,
    setAuthError,
  } = useSocialAuth();

  const handleRegister = async () => {
    if (!validate() || !isLoaded) return;
    setLoadingAction("email");
    setAuthError(null);

    try {
      const result = await signUp.create({
        emailAddress: values.email,
        password: values.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });

        try {
          const accountData = await onboardingService.getAccountStatus();
          const step = resolveOnboardingStep(accountData);
          await setStep(step);
          const routes: Record<string, string> = {
            referral: "/(onboarding)/referral",
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
      } else {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        router.push("/(auth)/verify-email?flow=signup");
      }
    } catch (err: any) {
      setAuthError(
        err?.errors?.[0]?.longMessage ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoadingAction(null);
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
              value={values.email}
              onChangeText={(t) => setValue("email", t)}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
              icon={<Mail size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
            />

            <Input
              label="Password"
              value={values.password}
              onChangeText={(t) => setValue("password", t)}
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
            />

            <Input
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={(t) => setValue("confirmPassword", t)}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              icon={<ShieldCheck size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
            />

            {authError && <ErrorBanner message={authError} />}

            <Button
              title="Create Account"
              onPress={handleRegister}
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

          {/* Login Link */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600).springify()}
            className="mt-8 flex-row justify-center"
          >
            <Text className="text-sm text-white/70">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text className="text-sm font-semibold text-white">Sign In</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
