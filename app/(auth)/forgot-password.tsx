import { useState } from "react";
import { View, Text, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSignIn } from "@clerk/clerk-expo";
import { Mail, ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
// eslint-disable-next-line import/no-unresolved
import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { emailSchema } from "@/lib/schemas";
import { getClerkErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import * as Sentry from "@sentry/react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { values, errors, setValue, validate } = useForm(
    { email: "" },
    z.object({ email: emailSchema }),
  );

  const handleSubmit = async () => {
    if (!validate() || !isLoaded) return;
    setLoading(true);
    setAuthError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: values.email,
      });
      setSent(true);
    } catch (err: unknown) {
      Sentry.captureException(err);
      setAuthError(getClerkErrorMessage(err, "Could not send reset email. Please try again."));
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
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          className="mt-2 self-start"
          icon={<ArrowLeft size={24} color={COLORS.white} />}
        />

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mt-8">
          <Text className="text-2xl font-bold text-white">Reset Password</Text>
          <Text className="mt-2 text-base text-white/70">
            {sent
              ? "Check your email for a password reset link."
              : "Enter your email and we'll send you a reset code."}
          </Text>
        </Animated.View>

        {!sent ? (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="mt-8 gap-4"
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
              textColor={COLORS.white}
            />

            {authError && <ErrorBanner message={authError} />}

            <Button
              title="Send Reset Code"
              onPress={handleSubmit}
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
                A password reset code has been sent to{" "}
                <Text className="font-semibold">{values.email}</Text>
              </Text>
            </View>

            <Button title="Back to Login" onPress={() => router.back()} size="lg" />
          </Animated.View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
