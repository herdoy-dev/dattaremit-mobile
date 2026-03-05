import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import {
  Send,
  Download,
  Landmark,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react-native";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useBiometric } from "@/hooks/use-biometric";
import { TransactionItem } from "@/components/ui/transaction-item";
import { BiometricEnrollmentModal } from "@/components/biometric/biometric-enrollment-modal";
import { COLORS } from "@/constants/theme";
import { RECENT_TRANSACTIONS } from "@/__mocks__/transactions";

export default function HomeTab() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading, isError } = useAccountQuery();
  const {
    isLoaded: biometricLoaded,
    isEnabled: biometricEnabled,
    hardwareStatus,
    hasBeenPrompted,
  } = useBiometric();

  useEffect(() => {
    if (!biometricLoaded || biometricEnabled) return;
    if (!hardwareStatus.hasHardware || !hardwareStatus.isEnrolled) return;

    hasBeenPrompted().then((prompted) => {
      if (!prompted) setShowEnrollment(true);
    });
  }, [biometricLoaded, biometricEnabled, hardwareStatus]);

  const user = account?.data?.user;
  const address = account?.data?.addresses?.[0];
  const isUSUser = address?.country === "US";

  const QUICK_ACTIONS = useMemo(
    () => {
      const actions = [];
      if (isUSUser) {
        actions.push({ icon: Send, label: "Send", color: primary });
      } else {
        actions.push({ icon: Download, label: "Receive", color: COLORS.success });
      }
      actions.push({ icon: Landmark, label: "Add Bank", color: COLORS.warning });
      return actions;
    },
    [primary, isUSUser]
  );

  function handleQuickAction(label: string) {
    if (label === "Send") router.push("/(transfer)/send");
    else if (label === "Receive") router.push("/(transfer)/receive");
    else if (label === "Add Bank") router.push("/(transfer)/add-bank");
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <Text className="text-base text-light-text-muted dark:text-dark-text-muted">
          Failed to load account data.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="flex-row items-center justify-between px-6 pt-4 pb-2"
        >
          <View>
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Welcome back
            </Text>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              {user?.firstName ?? "User"}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={primary} />
          </Pressable>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="mx-6 mt-4 rounded-3xl p-6"
          style={{ backgroundColor: primary }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium" style={{ color: COLORS.whiteOverlay70 }}>
              Total Balance
            </Text>
            <Pressable
              onPress={() => setBalanceVisible(!balanceVisible)}
              accessibilityRole="button"
              accessibilityLabel={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? (
                <Eye size={20} color={COLORS.whiteOverlay70} />
              ) : (
                <EyeOff size={20} color={COLORS.whiteOverlay70} />
              )}
            </Pressable>
          </View>
          <Text className="mt-2 text-4xl font-bold text-white">
            {balanceVisible ? "$12,580.50" : "********"}
          </Text>
          <View className="mt-4 flex-row items-center">
            <View className="mr-2 rounded-full px-2.5 py-1" style={{ backgroundColor: COLORS.whiteOverlay20 }}>
              <Text className="text-xs font-semibold text-white">
                +12.5% this month
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="mx-6 mt-6"
        >
          <Text className="mb-4 text-base font-semibold text-light-text dark:text-dark-text">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.label}
                entering={FadeInRight.delay(500 + index * 100).duration(500)}
                className="flex-1"
              >
                <Pressable
                  className="flex-row items-center justify-center gap-3 rounded-2xl py-4"
                  style={{ backgroundColor: `${action.color}15` }}
                  onPress={() => handleQuickAction(action.label)}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${action.color}25` }}
                  >
                    <action.icon size={20} color={action.color} />
                  </View>
                  <Text className="text-sm font-semibold" style={{ color: action.color }}>
                    {action.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600).springify()}
          className="mt-8 px-6"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-light-text dark:text-dark-text">
              Recent Transactions
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/activity")}>
              <Text className="text-sm font-medium text-primary">See All</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {RECENT_TRANSACTIONS.map((tx, index) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(700 + index * 80).duration(500)}
              >
                <TransactionItem transaction={tx} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <BiometricEnrollmentModal
        visible={showEnrollment}
        onClose={() => setShowEnrollment(false)}
      />
    </SafeAreaView>
  );
}
