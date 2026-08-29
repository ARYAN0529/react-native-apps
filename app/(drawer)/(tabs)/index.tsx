import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChatsScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (error) console.log('error:', error);
    setConversations(data || []);
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-white">

      {/* Search box  */}
      <TouchableOpacity
        className="mx-4 mt-4 mb-2 flex-row items-center bg-gray-100 rounded-xl px-3 py-3"
        onPress={() => router.push('/users')}
      >
        <FontAwesome name="search" size={16} color="gray" />
        <Text className="ml-2 flex-row items-center text-gray-400 text-base">Search users...</Text>
      </TouchableOpacity>

      {/* Empty state */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-base">No conversations yet</Text>
        <Text className="text-gray-400 text-sm mt-1">Tap + New Chat to start</Text>
      </View>

    </View>
  );
}