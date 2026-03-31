import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import {
  User,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import type { Recipient } from "@/services/recipient";

interface RecipientCardProps {
  recipient: Recipient;
  onPress?: () => void;
}

const STATUS_CONFIG = {
  PENDING: { label: "KYC Pending", color: "#f59e0b", Icon: Clock },
  APPROVED: { label: "KYC Approved", color: "#10b981", Icon: CheckCircle },
  REJECTED: { label: "KYC Rejected", color: "#ef4444", Icon: XCircle },
  FAILED: { label: "KYC Failed", color: "#ef4444", Icon: AlertTriangle },
} as const;

export const RecipientCard = memo(function RecipientCard({
  recipient,
  onPress,
}: RecipientCardProps) {
  const { primary } = useThemeColors();

  const status = STATUS_CONFIG[recipient.kycStatus];
  const name = `${recipient.firstName} ${recipient.lastName}`.trim();
  const isReady = recipient.kycStatus === "APPROVED" && recipient.hasBankAccount;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
      accessibilityRole="button"
      accessibilityLabel={`Recipient ${name}`}
    >
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(primary, 0.1) }}
      >
        <User size={20} color={primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-light-text dark:text-dark-text">{name}</Text>
        <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
          {recipient.email}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <status.Icon size={12} color={status.color} />
          <Text style={{ color: status.color }} className="text-xs font-medium">
            {status.label}
          </Text>
          {recipient.kycStatus === "APPROVED" && !recipient.hasBankAccount && (
            <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
              {" "}
              · Add bank
            </Text>
          )}
          {isReady && (
            <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
              {" "}
              · Ready to send
            </Text>
          )}
        </View>
      </View>
      <ChevronRight size={18} color={COLORS.placeholder} />
    </Pressable>
  );
});
