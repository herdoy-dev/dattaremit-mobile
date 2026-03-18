import { View, Text, Pressable, ScrollView, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Mail, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { SocialAuthSection } from "@/components/auth/social-auth-section";
import * as Sentry from "@sentry/react-native";
import { useForm } from "@/hooks/use-form";
import { useSocialAuth } from "@/hooks/use-social-auth";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { validateEmail } from "@/lib/validation";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { routeAfterAuth } = usePostAuthRouting();

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
        await routeAfterAuth();
      } else {
        const emailFactor = result.supportedFirstFactors?.find(
          (f): f is Extract<typeof f, { strategy: "email_code" }> =>
            f.strategy === "email_code"
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          router.push("/(auth)/verify-email?flow=signin");
        }
      }
    } catch (err: unknown) {
      Sentry.captureException(err);
      setAuthError(
        getClerkErrorMessage(err, "Invalid email or password. Please try again.")
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
            accessibilityLabel="DattaRemit logo"
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

          <SocialAuthSection
            onGoogle={() => handleSocialAuth("oauth_google")}
            onApple={() => handleSocialAuth("oauth_apple")}
            loadingAction={loadingAction}
          />

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
