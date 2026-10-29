import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onNext: () => void;
  disabled?: boolean; // grays the button out
  loading?: boolean;  // shows a spinner in the button
  accent?: boolean;   // orange button (use on the final step)
  children: ReactNode;
};

// Shared shell: back arrow, title, subtitle, content, bottom button.
// Every register step uses this so they all look the same.
export default function AuthScreen({
  title, subtitle, buttonLabel, onNext, disabled, loading, accent, children,
}: Props) {
  const insets = useSafeAreaInsets();
  const inactive = disabled || loading;

  // button color: orange on the final step, dark otherwise, gray when inactive
  const buttonColor = inactive ? 'bg-neutral-400' : accent ? 'bg-[#FF5A00]' : 'bg-[#1C1C1C]';

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-[#FDFCF7] px-6"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
    >
      {router.canGoBack() && (
        <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-1">
          <FontAwesome name="chevron-left" size={18} color="#1C1C1C" />
        </TouchableOpacity>
      )}

      <Text className="text-3xl font-bold tracking-tight text-gray-900">{title}</Text>
      <Text className="mt-2 mb-8 text-sm leading-5 text-gray-500">{subtitle}</Text>

      {/* the screen's own input(s) */}
      <View className="flex-1">{children}</View>

      <TouchableOpacity
        className={`h-14 items-center justify-center rounded-2xl ${buttonColor}`}
        onPress={onNext}
        disabled={inactive}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-base font-semibold text-white">{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}