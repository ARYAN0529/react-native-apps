import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Conversation = {
  conversation_id: string;
  username: string;
  last_message: string | null;
  last_message_at: string | null;
};

// gives each username a consistent color like Telegram does
const AVATAR_COLORS = ['#2AABEE', '#E91E63', '#9C27B0', '#FF9800', '#4CAF50', '#F44336', '#00BCD4'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// formats time exactly like Telegram — "3:11 PM" for today, "Mon" for this week, "17/09" for older
function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' }); // "Mon", "Tue"
  } else {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }); // "17/09"
  }
}

export default function ChatsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
        <ActivityIndicator size="large" color="#2AABEE" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      {/* Telegram-style search bar */}
      <TouchableOpacity
        className="mx-3 mt-3 mb-2 flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5"
        onPress={() => router.push('/users')}
        activeOpacity={0.7}
      >
        <FontAwesome name="search" size={15} color="#8E8E93" />
        <Text className="ml-2 text-gray-400 text-base">Search</Text>
      </TouchableOpacity>

      {conversations.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-base">No conversations yet</Text>
          <Text className="text-gray-400 text-sm mt-1">Search a user to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              style={{ minHeight: 72 }}
              onPress={() => router.push(`/chat/${item.conversation_id}`)}
              activeOpacity={0.6}
            >
              {/* Colored avatar with first letter */}
              <View
                className="w-14 h-14 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: getAvatarColor(item.username) }}
              >
                <Text className="text-white font-bold text-xl">
                  {item.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>

              {/* Name + last message */}
              <View className="flex-1 border-b border-gray-100 py-2" style={{ minHeight: 72, justifyContent: 'center' }}>
                <View className="flex-row justify-between items-center">
                  {/* Bold username like Telegram */}
                  <Text className="text-base font-semibold text-black flex-1 mr-2" numberOfLines={1}>
                    {item.username}
                  </Text>
                  {/* Timestamp — top right */}
                  {item.last_message_at && (
                    <Text style={{ fontSize: 12, color: '#8E8E93' }}>
                      {formatTime(item.last_message_at)}
                    </Text>
                  )}
                </View>
                {/* Last message preview */}
                <Text className="text-sm mt-0.5" style={{ color: '#8E8E93' }} numberOfLines={1}>
                  {item.last_message ?? 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}