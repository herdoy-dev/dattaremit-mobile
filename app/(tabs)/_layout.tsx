import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Home, Activity, UserCircle } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useColorScheme } from "nativewind";
import { useOnboardingGuard } from "@/hooks/use-onboarding-guard";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { primary, surface, border } = useThemeColors();

  const { isReady } = useAuthGuard();
  useOnboardingGuard();

  if (!isReady) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: surface,
          borderTopColor: border,
          height: Platform.OS === "ios" ? 100 : 80,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 32 : 16,
        },
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: isDark ? COLORS.muted : COLORS.placeholder,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Home size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Activity size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <UserCircle size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  const { primary } = useThemeColors();
  return (
    <View
      className="items-center justify-center rounded-xl px-3 py-1"
      style={focused ? { backgroundColor: hexToRgba(primary, 0.1) } : undefined}
    >
      {children}
    </View>
  );
}
