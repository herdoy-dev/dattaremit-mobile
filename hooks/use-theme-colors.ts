import { useThemeStore } from "@/store/theme-store";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useThemeColors() {
  const { preset, colors } = useThemeStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    preset,
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    bg: isDark ? colors.darkBg : colors.lightBg,
    surface: isDark ? colors.darkSurface : colors.lightSurface,
    surfaceAlt: isDark ? colors.darkSurfaceLight : colors.lightSurfaceDark,
    border: isDark ? colors.darkBorder : colors.lightBorder,
    borderFocus: isDark ? colors.darkBorderFocus : colors.lightBorderFocus,
    rawColors: colors,
  };
}
