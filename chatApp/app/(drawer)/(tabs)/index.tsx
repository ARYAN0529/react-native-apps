import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// chat page with list of conversations 
type Conversation = {
  conversation_id: string;
  username: string;
  last_message: string | null;
  last_message_at: string | null;
};

export default function ChatsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initial load
    fetchConversations();

    // realtime listener — re-fetches list when any new message arrives
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations(); // refresh list so last message + order updates
        }
      )
      .subscribe();

    // stop listening when screen unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchConversations() {
    const { data, error } = await supabase.rpc('get_my_conversations');
    if (error) console.log('fetch error:', error);
    setConversations(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      {/* Search box — navigates to user search page */}
      <TouchableOpacity
        className="mx-4 mt-4 mb-2 flex-row items-center bg-gray-100 rounded-xl px-3 py-3"
        onPress={() => router.push('/users')}
      >
        <FontAwesome name="search" size={16} color="gray" />
        <Text className="ml-2 text-gray-400 text-base">Search users...</Text>
      </TouchableOpacity>

      {conversations.length === 0 ? (
        // shown only when list is truly empty
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-base">No conversations yet</Text>
          <Text className="text-gray-400 text-sm mt-1">Search a user to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-gray-100"
              onPress={() => router.push(`/chat/${item.conversation_id}`)}
            >
              {/* Avatar with first letter of username */}
              <View className="w-11 h-11 rounded-full bg-blue-500 justify-center items-center mr-3">
                <Text className="text-white font-bold text-base">
                  {item.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>

              {/* Username + last message preview */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-black">{item.username}</Text>
                <Text className="text-sm text-gray-400 mt-0.5" numberOfLines={1}>
                  {item.last_message ?? 'No messages yet'}
                </Text>
              </View>

              {/* Time of last message */}
              {item.last_message_at && (
                <Text className="text-xs text-gray-400">
                  {new Date(item.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}