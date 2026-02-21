import { View, Text, Pressable, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, QrCode, Copy, Share2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { getReceiveInfo } from "@/services/transfer";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";

export default function ReceiveScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: info } = useQuery({
    queryKey: ["receiveInfo"],
    queryFn: getReceiveInfo,
  });

  function handleCopy(value: string) {
    Alert.alert("Copied!", `${value} copied to clipboard`);
  }

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

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-6 pt-4 pb-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
        >
          <ArrowLeft size={20} color="#6B7280" />
        </Pressable>
        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Receive Money
        </Text>
      </Animated.View>

      <View className="flex-1 px-6 pt-6">
        {/* QR Code Placeholder */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="items-center"
        >
          <View className="h-[200px] w-[200px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-light-surface dark:border-gray-600 dark:bg-dark-surface">
            <QrCode size={64} color={primary} />
            <Text className="mt-2 text-xs text-light-text-muted dark:text-dark-text-muted">
              QR Code
            </Text>
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
                index < details.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
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
              >
                <Copy size={16} color={primary} />
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <View className="flex-1" />

        {/* Share Button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          className="pb-6"
        >
          <Button
            title="Share Details"
            onPress={handleShare}
            size="lg"
            icon={<Share2 size={20} color="#fff" />}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
