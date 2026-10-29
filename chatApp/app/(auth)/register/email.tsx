import { router } from 'expo-router';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthInput from '@/components/auth/AuthInput';
import { useRegisterStore } from '@/store/registerStore';

export default function EmailStep() {
  const { email, setDraft } = useRegisterStore();

  return (
    <AuthScreen
      title="Enter your email"
      subtitle="We'll use your email to create and secure your account."
      buttonLabel="Continue"
      disabled={!email.includes('@')}
      onNext={() => router.push('/(auth)/register/password')}
    >
      <AuthInput
        placeholder="Enter your email address"
        value={email}
        onChangeText={(t) => setDraft({ email: t })}
        keyboardType="email-address"
        autoFocus
      />
    </AuthScreen>
  );
}