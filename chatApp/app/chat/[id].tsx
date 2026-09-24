import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ChatInputBar from '@/components/ChatInputBar';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

// same color logic as chat list — consistent avatar color per username
const AVATAR_COLORS = ['#2AABEE', '#E91E63', '#9C27B0', '#FF9800', '#4CAF50', '#F44336', '#00BCD4'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// formats message timestamp — just HH:MM inside chat
function formatMessageTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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
        // get current logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace('/(auth)/login');
          return;
        }
        setCurrentUserId(user.id);

        // get the other person's username via RPC
        const { data: partner, error: partnerError } = await supabase.rpc(
          'get_conversation_partner',
          { conv_id: id }
        );
        if (partnerError) console.log('partner error:', partnerError);
        else if (partner && partner.length > 0) setOtherUsername(partner[0].username);

        // load existing messages
        await fetchMessages();

        // realtime listener for new messages in this chat
        channel = supabase
          .channel(`chat:${id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
            (payload) => {
              const newMsg = payload.new as Message;
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev; // skip duplicate
                return [...prev, newMsg];
              });
              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
            }
          )
          .subscribe();
      } catch (err) {
        console.log('setup error:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    }

    setup();
    return () => { if (channel) supabase.removeChannel(channel); };
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
    setNewMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }

    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: id, sender_id: user.id, content: text });

    if (error) {
      console.log('send error:', error);
      setNewMessage(text); // restore text so user doesn't lose it
      setError('Failed to send message');
    }

    setSending(false);
  }

  // --- loading / error states ---

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2AABEE" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-base text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 px-6 py-3 rounded-full"
          style={{ backgroundColor: '#2AABEE' }}
          onPress={() => { setError(null); setLoading(true); fetchMessages(); }}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>

      {/* Header — Telegram style */}
      <View
        className="flex-row items-center px-3 py-2 border-b border-gray-100"
        style={{ minHeight: 56 }}
      >
        {/* Back button — Telegram uses chevron, not arrow */}
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1">
          <FontAwesome name="chevron-left" size={20} color="#2AABEE" />
        </TouchableOpacity>

        {/* Avatar with consistent color */}
        <View
          className="w-10 h-10 rounded-full justify-center items-center mr-2"
          style={{ backgroundColor: getAvatarColor(otherUsername) }}
        >
          <Text className="text-white font-bold text-base">
            {otherUsername?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>

        {/* Name + online subtitle */}
        <View className="flex-1">
        <Text className="text-base font-semibold text-black">{otherUsername || 'Chat'}</Text>
       </View>
      </View>

      {/* Messages — Telegram uses a very light gray background */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={16}
        style={{ backgroundColor: '#F0F2F5' }} // Telegram's chat bg color
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
              <View key={item.id} className={`mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                <View
                  style={{
                    // my messages = Telegram blue, theirs = white card
                    backgroundColor: isMe ? '#2AABEE' : '#ffffff',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    // Telegram's asymmetric bubble corners
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    maxWidth: '80%',
                    // subtle shadow on received messages
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isMe ? 0 : 0.06,
                    shadowRadius: 2,
                    elevation: isMe ? 0 : 1,
                  }}
                >
                  <Text style={{ color: isMe ? '#ffffff' : '#111827', fontSize: 15 }}>
                    {item.content}
                  </Text>
                  {/* Timestamp inside bubble — bottom right, like Telegram */}
                  <Text
                    style={{
                      fontSize: 11,
                      marginTop: 3,
                      textAlign: 'right',
                      color: isMe ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                    }}
                  >
                    {formatMessageTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </KeyboardAwareScrollView>

      {/* Input bar */}
      <ChatInputBar
        value={newMessage}
        onChangeText={setNewMessage}
        onSend={sendMessage}
        sending={sending}
      />
    </View>
  );
}