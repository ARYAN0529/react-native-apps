import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View className='flex-1 items-center justify-center bg-white gap-3'>
      <Text className="text-2xl font-bold text-gray-800">
        Welcome to ChatApp!
      </Text>

      <Link href="/onboarding" asChild >
        <TouchableOpacity className='w-64 items-center bg-blue-500 rounded-lg px-4 py-3'>
          <Text className='text-white font-semibold'>Start Connecting</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(auth)/sign-in" asChild >
        <TouchableOpacity className='w-64 items-center bg-zinc-400 rounded-lg px-4 py-3'>
          <Text className='text-white font-semibold'>Sign In</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity className='w-64 items-center bg-zinc-400 rounded-lg px-4 py-3'>
          <Text className='text-white font-semibold'>Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}