
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

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username || !email || !password) {
      Alert.alert(
        'Missing information',
        'Please fill in all the fields.'
      );
      return;
    }

    setLoading(true);

    console.log('Registering with:', {
      username,
      email,
      password,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      Alert.alert('Registration failed', error.message);
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
              Create an account
            </Text>

            <Text className="mt-2 text-base leading-6 text-gray-500">
              Sign up to get started with your account.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">

            {/* Username */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Username
              </Text>

              <TextInput
                className="h-14 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

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
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`mt-2 h-14 items-center justify-center rounded-xl ${
                loading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-sm text-gray-500">
              Already have an account?{' '}
            </Text>

            <Link
              href="/(auth)/login"
              className="text-sm font-semibold text-blue-600"
            >
              Login
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

