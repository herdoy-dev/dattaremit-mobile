import { View, Text, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { Camera, Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { FieldLabel } from "@/components/ui/field-label";
import { FieldError } from "@/components/ui/field-error";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (uri: string) => void;
  error?: string | null;
  variant?: "document" | "selfie";
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  variant = "document",
  className = "",
}: ImageUploadProps) {
  const scaleUpload = useSharedValue(1);
  const scaleCamera = useSharedValue(1);
  const { primary } = useThemeColors();

  const uploadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleUpload.value }],
  }));

  const cameraAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCamera.value }],
  }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: variant === "selfie" ? [1, 1] : [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: variant === "selfie" ? [1, 1] : [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View className={className}>
      <FieldLabel label={label} />

      {value ? (
        <Animated.View entering={FadeIn.duration(300)} className="relative">
          <Image
            source={{ uri: value }}
            className={`w-full rounded-xl ${variant === "selfie" ? "aspect-square" : "aspect-[4/3]"}`}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5"
            accessibilityRole="button"
            accessibilityLabel="Remove image"
          >
            <X size={16} color="#fff" />
          </Pressable>
        </Animated.View>
      ) : (
        <View className="flex-row gap-3">
          <AnimatedPressable
            onPress={pickImage}
            onPressIn={() => {
              scaleUpload.value = withSpring(0.95);
            }}
            onPressOut={() => {
              scaleUpload.value = withSpring(1);
            }}
            style={uploadAnimatedStyle}
            className="flex-1 items-center justify-center rounded-xl border-2 border-dashed border-light-border py-8 dark:border-dark-border"
            accessibilityRole="button"
            accessibilityLabel="Upload image from gallery"
          >
            <Upload size={28} color={primary} />
            <Text className="mt-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Upload File
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={takePhoto}
            onPressIn={() => {
              scaleCamera.value = withSpring(0.95);
            }}
            onPressOut={() => {
              scaleCamera.value = withSpring(1);
            }}
            style={cameraAnimatedStyle}
            className="flex-1 items-center justify-center rounded-xl border-2 border-dashed border-light-border py-8 dark:border-dark-border"
            accessibilityRole="button"
            accessibilityLabel="Take photo with camera"
          >
            <Camera size={28} color={primary} />
            <Text className="mt-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Take Photo
            </Text>
          </AnimatedPressable>
        </View>
      )}

      <FieldError error={error} />
    </View>
  );
}
