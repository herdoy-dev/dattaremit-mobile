import { View, Text } from "react-native";
import { LogOut } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/constants/theme";

interface LogoutModalProps {
  onLogout: () => void;
  onCancel: () => void;
}

export function LogoutModal({ onLogout, onCancel }: LogoutModalProps) {
  return (
    <View className="items-center pt-2">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
        <LogOut size={28} color={COLORS.error} />
      </View>
      <Text className="text-xl font-bold text-light-text dark:text-dark-text">
        Log Out?
      </Text>
      <Text className="mt-2 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Are you sure you want to log out of your account?
      </Text>
      <View className="mt-6 w-full gap-3">
        <Button title="Log Out" onPress={onLogout} variant="danger" />
        <Button title="Cancel" onPress={onCancel} variant="ghost" />
      </View>
    </View>
  );
}
