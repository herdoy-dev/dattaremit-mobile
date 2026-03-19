import { View, Text, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { useThemeStore, THEME_META } from "@/store/theme-store";

export function ThemePicker() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { preset, setPreset } = useThemeStore();

  return (
    <View className="items-center pt-2">
      <Text className="text-lg font-bold text-light-text dark:text-dark-text">Choose Theme</Text>
      <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Select a color theme for the app
      </Text>
      <View className="mt-6 flex-row flex-wrap justify-center">
        {THEME_META.map((theme) => (
          <Pressable
            key={theme.key}
            onPress={() => setPreset(theme.key)}
            className="mb-4 w-1/4 items-center"
            accessibilityRole="button"
            accessibilityLabel={`${theme.label} theme`}
            accessibilityState={{ selected: preset === theme.key }}
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
              {preset === theme.key && <View className="h-3 w-3 rounded-full bg-white" />}
            </View>
            <Text className="mt-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
              {theme.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
