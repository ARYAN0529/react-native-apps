import { Stack } from 'expo-router';

// own Stack so the steps slide forward/back and share one history
export default function RegisterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FDFCF7' },
        animation: 'slide_from_right',
      }}
    />
  );
}