import { Stack } from "expo-router";

export default function TransferLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="send" />
      <Stack.Screen name="receive" />
      <Stack.Screen name="add-bank" />
    </Stack>
  );
}
