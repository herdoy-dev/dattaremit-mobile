import { View, Text, Pressable, ScrollView, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Mail, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { GoogleIcon, AppleIcon } from "@/components/icons/social-icons";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useForm } from "@/hooks/use-form";
import { useSocialAuth } from "@/hooks/use-social-auth";
import { validateEmail } from "@/lib/validation";
import { resolveOnboardingStep } from "@/lib/utils";
import { onboardingService } from "@/services/onboarding";
import { COLORS } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { signIn, setActive, isLoaded } = useSignIn();

  const { values, errors, setValue, validate } = useForm(
    { email: "", password: "" },
    {
      email: (v) => validateEmail(v),
      password: (v) => (v ? null : "Password is required"),
    }
  );

  const {
    handleSocialAuth,
    loadingAction,
    setLoadingAction,
    authError,
    setAuthError,
  } = useSocialAuth();

  const handleLogin = async () => {
    if (!validate() || !isLoaded) return;
    setLoadingAction("email");
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });

        // Check server for existing account status
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
      } else {
        // Email verification required — prepare first factor and redirect
        const emailFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          router.push("/(auth)/verify-email?flow=signin");
        }
      }
    } catch (err: any) {
      setAuthError(
        err?.errors?.[0]?.longMessage ||
          "Invalid email or password. Please try again."
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
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
            />

            {authError && <ErrorBanner message={authError} />}

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
