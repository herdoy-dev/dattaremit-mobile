import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { GoogleIcon, AppleIcon } from "@/components/icons/social-icons";

interface SocialAuthSectionProps {
  onGoogle: () => void;
  onApple: () => void;
  loadingAction: string | null;
}

export function SocialAuthSection({
  onGoogle,
  onApple,
  loadingAction,
}: SocialAuthSectionProps) {
  return (
    <>
      {/* Divider */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600).springify()}
        className="my-8 flex-row items-center"
      >
        <View className="h-px flex-1 bg-white/20" />
        <Text className="mx-4 text-sm text-white/50">Or continue with</Text>
        <View className="h-px flex-1 bg-white/20" />
      </Animated.View>

      {/* Social Auth Buttons */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(600).springify()}
        className="gap-3"
      >
        <Button
          title="Continue with Google"
          onPress={onGoogle}
          variant="outline"
          size="lg"
          icon={<GoogleIcon />}
          loading={loadingAction === "oauth_google"}
          disabled={!!loadingAction}
        />
        <Button
          title="Continue with Apple"
          onPress={onApple}
          variant="outline"
          size="lg"
          icon={<AppleIcon color="#FFFFFF" />}
          loading={loadingAction === "oauth_apple"}
          disabled={!!loadingAction}
        />
      </Animated.View>
    </>
  );
}
