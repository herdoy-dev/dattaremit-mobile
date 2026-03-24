import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { User, ChevronRight } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import type { Contact } from "@/services/transfer";

interface ContactCardProps {
  contact: Contact;
  onPress?: () => void;
}

export const ContactCard = memo(function ContactCard({ contact, onPress }: ContactCardProps) {
  const { primary } = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
      accessibilityRole="button"
      accessibilityLabel={`Contact ${contact.name}`}
    >
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(primary, 0.1) }}
      >
        <User size={20} color={primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
          {contact.name}
        </Text>
        <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
          {contact.email}
        </Text>
      </View>
      <ChevronRight size={18} color={COLORS.placeholder} />
    </Pressable>
  );
});
