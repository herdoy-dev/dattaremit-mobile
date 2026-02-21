import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import {
  Send,
  Download,
  Landmark,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme-colors";

const RECENT_TRANSACTIONS = [
  {
    id: "1",
    name: "John Doe",
    type: "sent",
    amount: "-$250.00",
    date: "Today, 2:30 PM",
    icon: TrendingUp,
  },
  {
    id: "2",
    name: "Salary Deposit",
    type: "received",
    amount: "+$3,500.00",
    date: "Yesterday",
    icon: TrendingDown,
  },
  {
    id: "3",
    name: "Netflix",
    type: "sent",
    amount: "-$15.99",
    date: "Feb 18",
    icon: TrendingUp,
  },
  {
    id: "4",
    name: "Jane Smith",
    type: "received",
    amount: "+$120.00",
    date: "Feb 17",
    icon: TrendingDown,
  },
];

export default function HomeTab() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const router = useRouter();
  const { primary } = useThemeColors();

  const QUICK_ACTIONS = useMemo(
    () => [
      { icon: Send, label: "Send", color: primary },
      { icon: Download, label: "Receive", color: "#059669" },
      { icon: Landmark, label: "Add Bank", color: "#D97706" },
    ],
    [primary]
  );

  function handleQuickAction(label: string) {
    if (label === "Send") router.push("/(transfer)/send");
    else if (label === "Receive") router.push("/(transfer)/receive");
    else if (label === "Add Bank") router.push("/(transfer)/add-bank");
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
              User
            </Text>
          </View>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface">
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
            <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Total Balance
            </Text>
            <Pressable onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? (
                <Eye size={20} color="rgba(255,255,255,0.7)" />
              ) : (
                <EyeOff size={20} color="rgba(255,255,255,0.7)" />
              )}
            </Pressable>
          </View>
          <Text className="mt-2 text-4xl font-bold text-white">
            {balanceVisible ? "$12,580.50" : "********"}
          </Text>
          <View className="mt-4 flex-row items-center">
            <View className="mr-2 rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
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
          <View className="flex-row justify-between">
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.label}
                entering={FadeInRight.delay(500 + index * 100).duration(500)}
              >
                <Pressable className="items-center" onPress={() => handleQuickAction(action.label)}>
                  <View
                    className="mb-2 h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon size={24} color={action.color} />
                  </View>
                  <Text className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
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
            <Pressable>
              <Text className="text-sm font-medium text-primary">See All</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {RECENT_TRANSACTIONS.map((tx, index) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(700 + index * 80).duration(500)}
              >
                <Pressable className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface">
                  <View
                    className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                      tx.type === "received" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <tx.icon
                      size={20}
                      color={tx.type === "received" ? "#059669" : "#EF4444"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                      {tx.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
                      {tx.date}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      tx.type === "received"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500"
                    }`}
                  >
                    {tx.amount}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
