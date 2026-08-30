import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
};

/**
 * ChatInputBar — a sticky input bar that always sits above the keyboard.
 *
 * Uses `KeyboardStickyView` from `react-native-keyboard-controller` so the
 * input automatically lifts above the soft keyboard on both iOS and Android
 * without any manual offset calculations.
 */
export default function ChatInputBar({
  value,
  onChangeText,
  onSend,
  sending = false,
}: ChatInputBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardStickyView
      // offset.closed  = extra gap when keyboard is hidden (safe-area handled manually)
      // offset.opened  = extra gap when keyboard is visible (0 — flush to keyboard top)
      offset={{ closed: 0, opened: 0 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginRight: 10,
            fontSize: 15,
            maxHeight: 120,
            color: '#111827',
          }}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              value.trim() && !sending ? '#3b82f6' : '#d1d5db',
          }}
          onPress={onSend}
          disabled={!value.trim() || sending}
          activeOpacity={0.75}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="send" size={17} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardStickyView>
  );
}
