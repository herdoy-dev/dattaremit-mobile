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
  Gift,
  Fingerprint,
  ScanFace,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { CustomModal } from "@/components/ui/custom-modal";
import { SettingItem } from "@/components/ui/setting-item";
import { ThemePicker } from "@/components/account/theme-picker";
import { LogoutModal } from "@/components/account/logout-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useThemeStore, THEME_META } from "@/store/theme-store";
import { useBiometric } from "@/hooks/use-biometric";
import { hexToRgba } from "@/lib/utils";
import { getKycLabel, getKycBadge } from "@/lib/kyc-utils";
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
  const queryClient = useQueryClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const {
    isLoaded: biometricLoaded,
    isEnabled: biometricEnabled,
    hardwareStatus,
    label: biometricLabel,
    iconType: biometricIconType,
    enable: enableBiometric,
    disable: disableBiometric,
    clearEnrollment,
  } = useBiometric();

  const BiometricIcon = biometricIconType === "face" ? ScanFace : Fingerprint;

  const showBiometricSetting =
    biometricLoaded && hardwareStatus.hasHardware && hardwareStatus.isEnrolled;

  const { data: account, isLoading } = useAccountQuery();

  const user = account?.data?.user;
  const address = account?.data?.addresses?.[0];
  const accountStatus = account?.data?.accountStatus;

  const badge = getKycBadge(accountStatus);

  const handleLogout = async () => {
    await clearEnrollment();
    await signOut();
    await resetOnboarding();
    queryClient.clear();
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
              {isLoading ? "..." : user?.email ?? "\u2014"}
            </Text>
          </View>
          <View className={`rounded-full px-2.5 py-0.5 ${badge.bg}`}>
            <Text className={`text-xs font-medium ${badge.text}`}>
              {isLoading ? "..." : getKycLabel(accountStatus)}
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
              icon={<User size={18} color={primary} />}
              label="Profile"
              value={isLoading ? "..." : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Edit profile"}
              onPress={() => router.push("/edit-profile")}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Mail size={18} color={primary} />}
              label="Email"
              value={isLoading ? "..." : user?.email ?? "\u2014"}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Phone size={18} color={primary} />}
              label="Phone"
              value={isLoading ? "..." : user?.phoneNumberPrefix && user?.phoneNumber ? `${user.phoneNumberPrefix} ${user.phoneNumber}` : "\u2014"}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<MapPin size={18} color={primary} />}
              label="Address"
              value={isLoading ? "..." : address ? `${address.city}, ${address.country}` : "No address"}
              onPress={() => router.push("/edit-address")}
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Shield size={18} color={primary} />}
              label="KYC Status"
              value={isLoading ? "..." : getKycLabel(accountStatus)}
              onPress={accountStatus !== "ACTIVE" ? () => router.push("/(onboarding)/kyc") : undefined}
            />
          </View>
        </Animated.View>

        {/* Referral */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(500)}
          className="mx-6 mt-6"
        >
          <View className="rounded-2xl bg-light-surface px-4 dark:bg-dark-surface">
            <SettingItem
              icon={<Gift size={18} color={primary} />}
              label="Refer & Earn Rewards"
              onPress={() => router.push("/referral")}
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
                  thumbColor={COLORS.white}
                  accessibilityLabel="Toggle dark mode"
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
            {showBiometricSetting && (
              <>
                <View className="h-px bg-light-border dark:bg-dark-border" />
                <SettingItem
                  icon={<BiometricIcon size={18} color={primary} />}
                  label={biometricLabel}
                  rightElement={
                    <Switch
                      value={biometricEnabled}
                      onValueChange={async (val) => {
                        if (val) {
                          await enableBiometric();
                        } else {
                          await disableBiometric();
                        }
                      }}
                      trackColor={{ false: "#E5E7EB", true: primary }}
                      thumbColor={COLORS.white}
                      accessibilityLabel={`Toggle ${biometricLabel}`}
                    />
                  }
                />
              </>
            )}
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Bell size={18} color={primary} />}
              label="Notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#E5E7EB", true: primary }}
                  thumbColor={COLORS.white}
                  accessibilityLabel="Toggle notifications"
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
