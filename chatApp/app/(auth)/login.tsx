import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing information', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login failed', error.message);
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md self-center">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome back
            </Text>

            <Text className="mt-2 text-base leading-6 text-gray-500">
              Login to continue to your account.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Email */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Email
              </Text>

              <TextInput
                className="h-14 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Password
              </Text>

              <TextInput
                className="h-14 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-2 h-14 items-center justify-center rounded-xl ${
                loading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-sm text-gray-500">
              Don't have an account?{' '}
            </Text>

            <Link
              href="/(auth)/register"
              className="text-sm font-semibold text-blue-600"
            >
              Register
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}