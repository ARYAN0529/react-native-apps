import { Stack } from 'expo-router';

export default function AppLayout() {
  // Stack is just a container here: it renders (tabs) and nothing else.
  // With no "index" screen in this folder, there is nothing earlier in history,
  // so pressing back on the chats list exits the app (like WhatsApp / Telegram).
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* tabs own their own headers/UI, so the stack never shows one */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}