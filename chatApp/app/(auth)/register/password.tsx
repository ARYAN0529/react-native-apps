import { router } from 'expo-router';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthInput from '@/components/auth/AuthInput';
import { useRegisterStore } from '@/store/registerStore';

export default function PasswordStep() {
  const { password, setDraft } = useRegisterStore();

  return (
    <AuthScreen
      title="Create a password"
      subtitle="Use at least 6 characters to keep your account secure."
      buttonLabel="Continue"
      disabled={password.length < 6}
      onNext={() => router.push('/(auth)/register/avatar')}
    >
      <AuthInput
        placeholder="Enter your password"
        value={password}
        onChangeText={(t) => setDraft({ password: t })}
        secureTextEntry
        autoFocus
      />
    </AuthScreen>
  );
}