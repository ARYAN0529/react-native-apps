// Chats list tab
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Conversation = {
  conversation_id: string;
  username: string;
  last_message: string | null;
  last_message_at: string | null;
};

// same name always maps to the same avatar color
const AVATAR_COLORS = ['#2AABEE', '#E91E63', '#9C27B0', '#FF9800', '#4CAF50', '#F44336', '#00BCD4'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// "3:11 PM" for today, "Mon" for this week, "17/09" for older
function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();

  // compare calendar days (midnight to midnight), not raw 24h gaps
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }
}

// thin line between chats, starts after the avatar (16 padding + 56 avatar + 12 gap = 84)
function Separator() {
  return <View style={{ height: 0.5, marginLeft: 84, backgroundColor: '#E0E0E0' }} />;
}

export default function ChatsScreen() {
  // status bar height; edge-to-edge Android draws behind it, so we pad manually
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // realtime: any new message -> refetch so previews and order stay fresh
    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    // cleanup so we don't leak subscriptions
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchConversations() {
    const { data, error } = await supabase.rpc('get_my_conversations');
    if (error) console.log('fetch error:', error);
    setConversations(data || []);
    setLoading(false);
  }

  // same padding + background as the real screen so nothing jumps when data arrives
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F7F5]" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2AABEE" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F5]" style={{ paddingTop: insets.top }}>

      {/* Header row: title on the left, search button on the right */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <Text className="text-3xl font-bold tracking-tight text-gray-900">Chats</Text>

        {/* opens the user picker */}
        <TouchableOpacity
          onPress={() => router.push('/users')}
          activeOpacity={0.7}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-200"
        >
          <FontAwesome name="search" size={16} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-400">No conversations yet</Text>
          <Text className="mt-1 text-sm text-gray-400">Tap search to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id}
          // FlatList draws this between rows only, so no line after the last chat
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => router.push(`/chat/${item.conversation_id}`)}
              activeOpacity={0.6}
            >
              {/* colored avatar with first letter */}
              <View
                className="mr-3 h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: getAvatarColor(item.username) }}
              >
                <Text className="text-xl font-bold text-white">
                  {item.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>

              {/* name + time on top, last message below */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="mr-2 flex-1 text-base font-semibold text-black" numberOfLines={1}>
                    {item.username}
                  </Text>
                  {item.last_message_at && (
                    <Text style={{ fontSize: 12, color: '#8E8E93' }}>
                      {formatTime(item.last_message_at)}
                    </Text>
                  )}
                </View>
                <Text className="mt-0.5 text-sm" style={{ color: '#8E8E93' }} numberOfLines={1}>
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