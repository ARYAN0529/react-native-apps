import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' }, // same white behind every auth screen, no flash between them
        animation: 'fade', // subtle fade feels calmer than a hard slide
      }}
    />
  );
}