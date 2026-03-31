import { View } from "react-native";
import { hexToRgba } from "@/lib/utils";

const SIZES = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
} as const;

interface IconCircleProps {
  icon: React.ReactNode;
  size?: keyof typeof SIZES;
  color: string;
  opacity?: number;
  className?: string;
}

export function IconCircle({
  icon,
  size = "lg",
  color,
  opacity = 0.1,
  className = "",
}: IconCircleProps) {
  return (
    <View
      className={`items-center justify-center rounded-full ${SIZES[size]} ${className}`}
      style={{ backgroundColor: hexToRgba(color, opacity) }}
    >
      {icon}
    </View>
  );
}
