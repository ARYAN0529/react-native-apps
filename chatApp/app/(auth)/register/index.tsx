import { router } from 'expo-router';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthInput from '@/components/auth/AuthInput';
import { useRegisterStore } from '@/store/registerStore';

export default function UsernameStep() {
  const { username, setDraft } = useRegisterStore();

  return (
    <AuthScreen
      title="What's your name?"
      subtitle="This is how your friends will find you."
      buttonLabel="Continue"
      disabled={username.trim().length < 3}
      onNext={() => router.push('/(auth)/register/email')}
    >
      <AuthInput
        placeholder="Choose a username"
        value={username}
        onChangeText={(t) => setDraft({ username: t })}
        autoFocus
      />
    </AuthScreen>
  );
}