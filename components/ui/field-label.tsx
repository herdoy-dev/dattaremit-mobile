import { Text } from "react-native";

interface FieldLabelProps {
  label: string;
  className?: string;
}

export function FieldLabel({ label, className }: FieldLabelProps) {
  if (!label) return null;
  return (
    <Text
      className={`mb-1.5 text-sm font-medium ${className || "text-light-text dark:text-dark-text"}`}
    >
      {label}
    </Text>
  );
}
