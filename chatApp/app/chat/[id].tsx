import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Platform } from 'react-native';
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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: members } = await supabase
      .from('conversation_members')
      .select('user_id, profiles(username)')
      .eq('conversation_id', id)
      .neq('user_id', user.id)
      .single();

    if (members?.profiles) {
      setOtherUsername((members.profiles as any).username);
    }

    fetchMessages();

    const channel = supabase
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
          setMessages((prev) => [...prev, payload.new as Message]);
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) console.log('error:', error);
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) console.log('send error:', error);
    setNewMessage('');
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
          <Text className="text-white font-bold">
            {otherUsername?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-xl font-bold">{otherUsername || 'Chat'}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.sender_id === currentUserId;
          return (
            <View className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
              <View className={`px-4 py-2 rounded-2xl max-w-xs ${isMe ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <Text className={isMe ? 'text-white' : 'text-black'}>
                  {item.content}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="justify-center items-center mt-20">
            <Text className="text-gray-400">No messages yet. Say hi! 👋</Text>
          </View>
        }
      />

      {/* Input */}
      <View className="px-4 py-3 border-t border-gray-200 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center"
          onPress={sendMessage}
        >
          <FontAwesome name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}