import { View, Text } from "react-native";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      {icon}
      <Text className="mt-4 text-center text-base font-medium text-light-text-muted dark:text-dark-text-muted">
        {title}
      </Text>
      {description && (
        <Text className="mt-1 text-center text-sm text-light-text-muted/60 dark:text-dark-text-muted/60">
          {description}
        </Text>
      )}
    </View>
  );
}
