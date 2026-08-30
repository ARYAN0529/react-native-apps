import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import ChatInputBar from '@/components/ChatInputBar';

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
  const scrollViewRef = useRef<any>(null);

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
              // Scroll to bottom when new message arrives
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
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
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
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

      {/* Messages list — KeyboardAwareScrollView keeps content above keyboard */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={16}
      >
        {messages.length === 0 ? (
          <View className="justify-center items-center mt-20">
            <Text className="text-gray-400 text-base">No messages yet</Text>
            <Text className="text-gray-400 text-sm mt-1">Say hi! 👋</Text>
          </View>
        ) : (
          messages.map((item) => {
            const isMe = item.sender_id === currentUserId;
            return (
              <View key={item.id} className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
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
          })
        )}
      </KeyboardAwareScrollView>

      {/* Sticky input bar — sits above the keyboard automatically */}
      <ChatInputBar
        value={newMessage}
        onChangeText={setNewMessage}
        onSend={sendMessage}
        sending={sending}
      />
    </View>
  );
}