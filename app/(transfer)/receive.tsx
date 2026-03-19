import { useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, Share, ActivityIndicator, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Copy, Share2 } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";

import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getReceiveInfo } from "@/services/transfer";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import { CLIPBOARD_CLEAR_MS } from "@/constants/limits";

export default function ReceiveScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading: isAccountLoading } = useAccountQuery();

  const address = account?.data?.addresses?.[0];

  // Only non-US users can receive money
  const isRestricted = account && address?.country === "US";

  const { data: info, isLoading: isInfoLoading } = useQuery({
    queryKey: ["receiveInfo"],
    queryFn: getReceiveInfo,
  });

  const lastCopiedRef = useRef<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear clipboard on app backgrounding
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && lastCopiedRef.current) {
        Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
    });
    return () => {
      sub.remove();
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async (value: string) => {
    await Clipboard.setStringAsync(value);
    lastCopiedRef.current = value;

    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    // Auto-clear after 60 seconds
    clearTimerRef.current = setTimeout(async () => {
      const current = await Clipboard.getStringAsync();
      if (current === value) {
        await Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
      clearTimerRef.current = null;
    }, CLIPBOARD_CLEAR_MS);
  }, []);

  async function handleShare() {
    if (!info) return;
    await Share.share({
      message: `Send money to my DattaRemit account:\nAccount ID: ${info.accountId}\nEmail: ${info.email}\nPhone: ${info.phone}`,
    });
  }

  const details = [
    { label: "Account ID", value: info?.accountId ?? "---" },
    { label: "Email", value: info?.email ?? "---" },
    { label: "Phone", value: info?.phone ?? "---" },
  ];

  if (isAccountLoading || isInfoLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
      </SafeAreaView>
    );
  }

  if (isRestricted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg px-6 dark:bg-dark-bg">
        <Text className="text-center text-lg font-bold text-light-text dark:text-dark-text">
          This feature is not available in your region.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-base font-semibold" style={{ color: primary }}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScreenHeader title="Receive Money" />

      <View className="flex-1 px-6 pt-6">
        {/* QR Code Placeholder */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center">
          <View className="h-[220px] w-[220px] items-center justify-center rounded-3xl bg-white p-3">
            {info ? (
              <QRCode
                value={JSON.stringify({
                  accountId: info.accountId,
                  email: info.email,
                  phone: info.phone,
                  name: info.name,
                })}
                size={180}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            ) : (
              <View className="h-[180px] w-[180px] items-center justify-center">
                <ActivityIndicator size="small" color={primary} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Account Details */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="mt-8 rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
        >
          <Text className="mb-3 text-sm font-semibold text-light-text dark:text-dark-text">
            Account Details
          </Text>
          {details.map((item, index) => (
            <View
              key={item.label}
              className={`flex-row items-center justify-between py-3 ${
                index < details.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
              }`}
            >
              <View>
                <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
                  {item.label}
                </Text>
                <Text className="mt-0.5 text-sm font-medium text-light-text dark:text-dark-text">
                  {item.value}
                </Text>
              </View>
              <Pressable
                onPress={() => handleCopy(item.value)}
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: hexToRgba(primary, 0.1) }}
                accessibilityRole="button"
                accessibilityLabel={`Copy ${item.label}`}
              >
                <Copy size={16} color={primary} />
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <View className="flex-1" />

        {/* Share Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="pb-6">
          <Button
            title="Share Details"
            onPress={handleShare}
            size="lg"
            icon={<Share2 size={20} color={COLORS.white} />}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
