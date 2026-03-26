import { useState } from "react";
import { Text, ImageBackground, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { passwordSchema } from "@/lib/schemas";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import * as Sentry from "@sentry/react-native";

export default function NewPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { routeAfterAuth } = usePostAuthRouting();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { values, errors, setValue, validate } = useForm(
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

  const handleResetPassword = async () => {
    if (!validate() || !isLoaded || !signIn) return;
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn.resetPassword({
        password: values.password,
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
          contentContainerClassName="flex-grow justify-center pb-16"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.Image
            entering={FadeInDown.delay(100).duration(600).springify()}
            source={require("@/assets/images/logo.png")}
            className="mb-6 h-28 w-28 self-center"
            resizeMode="contain"
            accessibilityLabel="DattaRemit logo"
          />

          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="mb-8"
          >
            <Text className="text-center text-2xl font-bold text-white">Set New Password</Text>
            <Text className="mt-2 text-center text-base text-white/70">
              Choose a strong password for your account.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            className="gap-4"
          >
            <Input
              label="New Password"
              value={values.password}
              onChangeText={(t) => setValue("password", t)}
              placeholder="Enter new password"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={20} color={COLORS.placeholder} />}
              labelClassName="text-white"
              inputClassName="text-white"
              textColor={COLORS.white}
            />

            <Input
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={(t) => setValue("confirmPassword", t)}
              placeholder="Re-enter new password"
              secureTextEntry
              error={errors.confirmPassword}
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
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
