import { View, Text, ScrollView, Pressable, Switch } from "react-native";
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
  ChevronRight,
  Palette,
} from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { CustomModal } from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useThemeStore, THEME_META, hexToRgba } from "@/store/theme-store";
import { useState } from "react";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingItem({ icon, label, value, onPress, rightElement, danger }: SettingItemProps) {
  const { primary } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5"
    >
      <View
        className={`mr-3.5 h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-100 dark:bg-red-900/30" : ""}`}
        style={!danger ? { backgroundColor: hexToRgba(primary, 0.1) } : undefined}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? "text-red-500" : "text-light-text dark:text-dark-text"}`}>
          {label}
        </Text>
        {value && (
          <Text className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
            {value}
          </Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={18} color="#9CA3AF" />)}
    </Pressable>
  );
}

export default function AccountTab() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboardingStore();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { primary } = useThemeColors();
  const { preset, setPreset } = useThemeStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
              User
            </Text>
            <Text className="mt-0.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              user@example.com
            </Text>
          </View>
          <View className="rounded-full bg-green-100 px-2.5 py-0.5 dark:bg-green-900/30">
            <Text className="text-xs font-medium text-green-700 dark:text-green-400">
              Verified
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
              value="user@example.com"
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Phone size={18} color={primary} />}
              label="Phone"
              value="+1 234 567 890"
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<MapPin size={18} color={primary} />}
              label="Address"
              value="New York, US"
            />
            <View className="h-px bg-light-border dark:bg-dark-border" />
            <SettingItem
              icon={<Shield size={18} color={primary} />}
              label="KYC Status"
              value="Verified"
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
              icon={<LogOut size={18} color="#EF4444" />}
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
        <View className="items-center pt-2">
          <Text className="text-lg font-bold text-light-text dark:text-dark-text">
            Choose Theme
          </Text>
          <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Select a color theme for the app
          </Text>
          <View className="mt-6 flex-row flex-wrap justify-center">
            {THEME_META.map((theme) => (
              <Pressable
                key={theme.key}
                onPress={() => setPreset(theme.key)}
                className="mb-4 w-1/4 items-center"
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: theme.color,
                    borderWidth: preset === theme.key ? 3 : 0,
                    borderColor: isDarkMode ? "#FFFFFF" : "#111827",
                  }}
                  className="items-center justify-center"
                >
                  {preset === theme.key && (
                    <View className="h-3 w-3 rounded-full bg-white" />
                  )}
                </View>
                <Text className="mt-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  {theme.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </CustomModal>

      {/* Logout Confirmation Modal */}
      <CustomModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        snapPoint={0.38}
      >
        <View className="items-center pt-2">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <LogOut size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Log Out?
          </Text>
          <Text className="mt-2 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Are you sure you want to log out of your account?
          </Text>
          <View className="mt-6 w-full gap-3">
            <Button
              title="Log Out"
              onPress={handleLogout}
              variant="danger"
            />
            <Button
              title="Cancel"
              onPress={() => setShowLogoutModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
}
