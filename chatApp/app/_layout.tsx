import '../global.css';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(drawer)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(drawer)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
          </Stack>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}