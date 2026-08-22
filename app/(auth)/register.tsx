// have to recreate

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

 async function handleRegister() {
  setLoading(true);

  console.log('Registering with:', { username, email, password }); // check values

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

 // console.log('data:', data);   // check response
 // console.log('error:', error); // check exact error

  if (error) Alert.alert('Error', error.message);
  setLoading(false);
}

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-8">Register</Text>

      {/* Username */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* Email */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Register Button */}
      <TouchableOpacity
        className="bg-blue-500 rounded-lg py-4 items-center"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-base">
          {loading ? 'Creating account...' : 'Register'}
        </Text>
      </TouchableOpacity>

      {/* Go to Login */}
      <Link href="/(auth)/login" className="text-center mt-4 text-blue-500">
        Already have an account? Login
      </Link>
    </View>
  );
}