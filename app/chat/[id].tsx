import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [otherUsername, setOtherUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;

    let channel: any;

    async function setup() {
      try {
        // 1. Get current logged in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace('/(auth)/login');
          return;
        }
        setCurrentUserId(user.id);

        // 2. Get ALL members of this conversation to find the other user
        const { data: allMembers, error: membersError } = await supabase
          .from('conversation_members')
          .select('user_id, profiles(username)')
          .eq('conversation_id', id);

        console.log('all members:', allMembers);
        console.log('members error:', membersError);
        console.log('current user id:', user.id);

        if (membersError) {
          console.log('members error:', membersError);
        } else if (allMembers && allMembers.length > 0) {
          // Find the other user (not current user)
          const otherMember = allMembers.find(
            (m: any) => m.user_id !== user.id
          );
          if (otherMember?.profiles) {
            setOtherUsername((otherMember.profiles as any).username);
          }
        }

        // 3. Fetch existing messages
        await fetchMessages();

        // 4. Subscribe to realtime new messages via Supabase WebSocket
        channel = supabase
          .channel(`chat:${id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${id}`,
            },
            (payload) => {
              const newMsg = payload.new as Message;
              // Avoid duplicate messages
              setMessages((prev) => {
                const exists = prev.find((m) => m.id === newMsg.id);
                if (exists) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          )
          .subscribe((status) => {
            console.log('Realtime status:', status);
          });

      } catch (err) {
        console.log('setup error:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    }

    setup();

    // Cleanup WebSocket on unmount
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.log('fetch error:', error);
      setError('Failed to load messages');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }

  async function sendMessage() {
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setNewMessage(''); // clear input immediately for better UX

    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: currentUserId,
      content: text,
    });

    if (error) {
      console.log('send error:', error);
      setNewMessage(text); // restore message if send failed
      setError('Failed to send message');
    }

    setSending(false);
  }

  // --- Render states ---

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-base text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-full"
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMessages();
          }}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <View className="w-9 h-9 rounded-full bg-blue-500 justify-center items-center mr-2">
          <Text className="text-white font-bold text-base">
            {otherUsername?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-xl font-bold">{otherUsername || 'Chat'}</Text>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => {
          const isMe = item.sender_id === currentUserId;
          return (
            <View className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
              <View
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  isMe ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <Text className={isMe ? 'text-white' : 'text-black'}>
                  {item.content}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="justify-center items-center mt-20">
            <Text className="text-gray-400 text-base">No messages yet</Text>
            <Text className="text-gray-400 text-sm mt-1">Say hi! 👋</Text>
          </View>
        }
      />

      {/* Input bar */}
      <View className="px-4 py-3 border-t border-gray-200 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full justify-center items-center ${
            newMessage.trim() && !sending ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="send" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}