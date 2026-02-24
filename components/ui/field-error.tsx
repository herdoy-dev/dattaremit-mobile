import { Text } from "react-native";

interface FieldErrorProps {
  error?: string | null;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;
  return (
    <Text
      className="mt-1 text-xs text-red-500"
      accessibilityRole="text"
      accessibilityLabel={error}
    >
      {error}
    </Text>
  );
}
