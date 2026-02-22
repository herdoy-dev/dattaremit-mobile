import { View, Text, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Palette,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { CustomModal } from "@/components/ui/custom-modal";
import { SettingItem } from "@/components/ui/setting-item";
import { ThemePicker } from "@/components/account/theme-picker";
import { LogoutModal } from "@/components/account/logout-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useThemeStore, THEME_META, hexToRgba } from "@/store/theme-store";
import { COLORS } from "@/constants/theme";
import { useState } from "react";

export default function AccountTab() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboardingStore();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { primary } = useThemeColors();
  const { preset } = useThemeStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: account, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => onboardingService.getAccountStatus(),
  });

  const user = account?.data?.user;
  const address = account?.data?.addresses?.[0];
  const accountStatus = account?.data?.accountStatus;

  const kycStatusMap: Record<string, string> = {
    ACTIVE: "Verified",
    PENDING: "Pending",
    INITIAL: "Not Started",
    REJECTED: "Rejected",
  };

  const badgeColorMap: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
    PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
    INITIAL: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  };

  const badge = badgeColorMap[accountStatus ?? ""] ?? badgeColorMap.INITIAL;

  const handleLogout = async () => {
    await signOut();
    await resetOnboarding();
    setShowLogoutModal(false);
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            Account
          </Text>
        </View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="mx-6 mt-4 flex-row items-center rounded-2xl bg-light-surface p-5 dark:bg-dark-surface"
        >
          <View className="mr-4 h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: hexToRgba(primary, 0.1) }}>
            <User size={32} color={primary} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text">
              {isLoading ? "..." : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User"}
            </Text>
            <Text className="mt-0.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {isLoading ? "..." : user?.email ?? "—"}
            </Text>
          </View>
          <View className={`rounded-full px-2.5 py-0.5 ${badge.bg}`}>
            <Text className={`text-xs font-medium ${badge.text}`}>
              {isLoading ? "..." : kycStatusMap[accountStatus ?? ""] ?? "Unknown"}
            </Text>
          </View>
        </Animated.View>

        {/* Personal Info */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="mx-6 mt-6"
        >
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
            Personal Information
          </Text>
          <View className="rounded-2xl bg-light-surface px-4 dark:bg-dark-surface">
            <SettingItem
              icon={<Mail size={18} color={primary} />}
              label="Email"
              value={isLoading ? "..." : user?.email ?? "—"}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Phone size={18} color={primary} />}
              label="Phone"
              value={isLoading ? "..." : user?.phoneNumberPrefix && user?.phoneNumber ? `${user.phoneNumberPrefix} ${user.phoneNumber}` : "—"}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<MapPin size={18} color={primary} />}
              label="Address"
              value={isLoading ? "..." : address ? `${address.city}, ${address.country}` : "No address"}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Shield size={18} color={primary} />}
              label="KYC Status"
              value={isLoading ? "..." : kycStatusMap[accountStatus ?? ""] ?? "Unknown"}
            />
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          className="mx-6 mt-6"
        >
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
            Settings
          </Text>
          <View className="rounded-2xl bg-light-surface px-4 dark:bg-dark-surface">
            <SettingItem
              icon={isDarkMode ? <Moon size={18} color={primary} /> : <Sun size={18} color={primary} />}
              label="Dark Mode"
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => setColorScheme(val ? "dark" : "light")}
                  trackColor={{ false: "#E5E7EB", true: primary }}
                  thumbColor="#fff"
                />
              }
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Palette size={18} color={primary} />}
              label="Theme"
              value={THEME_META.find((t) => t.key === preset)?.label}
              onPress={() => setShowThemePicker(true)}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Bell size={18} color={primary} />}
              label="Notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#E5E7EB", true: primary }}
                  thumbColor="#fff"
                />
              }
            />
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mx-6 mt-6"
        >
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
            Support
          </Text>
          <View className="rounded-2xl bg-light-surface px-4 dark:bg-dark-surface">
            <SettingItem
              icon={<HelpCircle size={18} color={primary} />}
              label="Help Center"
              onPress={() => {}}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<FileText size={18} color={primary} />}
              label="Terms & Privacy"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          className="mx-6 mt-6"
        >
          <View className="rounded-2xl bg-light-surface px-4 dark:bg-dark-surface">
            <SettingItem
              icon={<LogOut size={18} color={COLORS.error} />}
              label="Log Out"
              danger
              onPress={() => setShowLogoutModal(true)}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Theme Picker Modal */}
      <CustomModal
        visible={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        snapPoint={0.35}
      >
        <ThemePicker />
      </CustomModal>

      {/* Logout Confirmation Modal */}
      <CustomModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        snapPoint={0.38}
      >
        <LogoutModal
          onLogout={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </CustomModal>
    </SafeAreaView>
  );
}
