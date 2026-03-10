import { View, Text, Pressable, Share, ActivityIndicator, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Copy, Share2, Check } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useState, useEffect, useRef } from "react";
import { onboardingService } from "@/services/onboarding";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { hexToRgba } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";

export default function ReferralScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: account, isLoading } = useAccountQuery();

  const referCode = account?.data?.user?.referCode;

  const { mutate: requestCode, isPending } = useMutation({
    mutationFn: () => onboardingService.requestReferCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const lastCopiedRef = useRef<string | null>(null);

  // Clear clipboard on app backgrounding
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && lastCopiedRef.current) {
        Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  const handleCopy = async () => {
    if (!referCode) return;
    await Clipboard.setStringAsync(referCode);
    lastCopiedRef.current = referCode;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Auto-clear after 60 seconds
    setTimeout(async () => {
      const current = await Clipboard.getStringAsync();
      if (current === referCode) {
        await Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
    }, 60000);
  };

  const handleShare = async () => {
    if (!referCode) return;
    await Share.share({
      message: `Join DattaRemit using my referral code: ${referCode}`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScreenHeader title="Refer & Earn" onBack={() => router.back()} />

      <View className="flex-1 px-6">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={primary} />
          </View>
        ) : (
          <View className="mt-4">
            {/* Promo header */}
            <View className="items-center mb-8">
              <View
                className="mb-4 h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(primary, 0.1) }}
              >
                <Gift size={32} color={primary} />
              </View>
              <Text className="text-lg font-bold text-light-text dark:text-dark-text text-center">
                Refer & Earn Rewards
              </Text>
              <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
                Share your referral code with friends and earn rewards when they sign up
              </Text>
            </View>

            {referCode ? (
              <>
                {/* Code display */}
                <Pressable
                  onPress={handleCopy}
                  className="flex-row items-center justify-between rounded-xl border border-dashed px-4 py-4"
                  style={{ borderColor: hexToRgba(primary, 0.4) }}
                  accessibilityRole="button"
                  accessibilityLabel={`Referral code ${referCode}. Tap to copy.`}
                >
                  <Text
                    className="text-lg font-bold tracking-widest"
                    style={{ color: primary }}
                  >
                    {referCode}
                  </Text>
                  {copied ? (
                    <Check size={18} color={primary} />
                  ) : (
                    <Copy size={18} color={primary} />
                  )}
                </Pressable>

                {/* Share button */}
                <View className="mt-4">
                  <Button
                    title="Share Code"
                    icon={<Share2 size={16} color="#fff" />}
                    onPress={handleShare}
                  />
                </View>
              </>
            ) : (
              <View>
                <Button
                  title="Request Refer Code"
                  icon={<Gift size={16} color="#fff" />}
                  onPress={() => requestCode()}
                  loading={isPending}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
