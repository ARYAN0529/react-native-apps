import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useStore } from '@/store/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SettingsScreen() {
  const { user, setUser } = useStore();

  useEffect(() => {
    if (!user) fetchUser(); // only fetch if not already in store
  }, []);

  async function fetchUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser({
        id: authUser.id,
        username: profile.username,
        email: profile.email,
      });
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold">Settings</Text>
      </View>

      {/* Profile Section */}
      <View className="mx-4 mt-6 bg-white rounded-2xl p-4 flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-blue-500 justify-center items-center mr-4">
          <Text className="text-white font-bold text-2xl">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View>
          <Text className="text-lg font-bold">{user?.username ?? 'Loading...'}</Text>
          <Text className="text-gray-500 text-sm">{user?.email ?? ''}</Text>
        </View>
      </View>

      {/* Settings Options */}
      <View className="mx-4 mt-6 bg-white rounded-2xl overflow-hidden">
        <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
          <FontAwesome name="user" size={18} color="gray" />
          <Text className="ml-3 text-base flex-1">Edit Profile</Text>
          <FontAwesome name="chevron-right" size={14} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
          <FontAwesome name="bell" size={18} color="gray" />
          <Text className="ml-3 text-base flex-1">Notifications</Text>
          <FontAwesome name="chevron-right" size={14} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
          <FontAwesome name="lock" size={18} color="gray" />
          <Text className="ml-3 text-base flex-1">Privacy</Text>
          <FontAwesome name="chevron-right" size={14} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center px-4 py-4">
          <FontAwesome name="question-circle" size={18} color="gray" />
          <Text className="ml-3 text-base flex-1">Help</Text>
          <FontAwesome name="chevron-right" size={14} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View className="mx-4 mt-6 bg-white rounded-2xl overflow-hidden">
        <TouchableOpacity
          className="flex-row items-center px-4 py-4"
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={18} color="red" />
          <Text className="ml-3 text-base text-red-500 font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-400 text-sm mt-8">ChatApp v1.0.0</Text>

    </View>
  );
}