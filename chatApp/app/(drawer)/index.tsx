import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/supabase';

export default function DrawerHome() {
  async function handleLogout() {
    await supabase.auth.signOut();
    // _layout.tsx onAuthStateChange will automatically redirect to login
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl mb-8">Welcome to ChatApp</Text>

      <TouchableOpacity
        className="bg-red-500 px-6 py-3 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}