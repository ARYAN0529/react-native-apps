import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  username: string;
  email: string;
};

// same color logic as index.tsx
const AVATAR_COLORS = ['#2AABEE', '#E91E63', '#9C27B0', '#FF9800', '#4CAF50', '#F44336', '#00BCD4'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (search === '') {
      setFiltered(users);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  async function fetchUsers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email')
      .neq('id', user.id);

    if (error) console.log('fetchUsers error:', error);
    setUsers(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  async function startConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing, error: existingError } = await supabase.rpc(
      'find_conversation',
      { other_user_id: otherUserId }
    );
    if (existingError) console.log('find_conversation error:', existingError);

    if (existing) {
      router.replace(`/chat/${existing}`);
      return;
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) { console.log('conv error:', convError); return; }

    const { error: membersError } = await supabase
      .from('conversation_members')
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: otherUserId },
      ]);

    if (membersError) { console.log('members error:', membersError); return; }

    router.replace(`/chat/${conversation.id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header — same style as index */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e5e5ea',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <FontAwesome name="arrow-left" size={18} color="#0f172a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#000', flex: 1 }}>
          New chat
        </Text>
      </View>

      {/* Search bar — same style as index */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f2f2f7',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 9,
        }}>
          <FontAwesome name="search" size={15} color="#8E8E93" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 15, color: '#000' }}
            placeholder="Search by username or email..."
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <FontAwesome name="times-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2AABEE" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filtered.length === 0 ? { flex: 1 } : undefined}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, minHeight: 72 }}
              activeOpacity={0.6}
              onPress={() => startConversation(item.id)}
            >
              {/* colored avatar — same as index */}
              <View style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: getAvatarColor(item.username),
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
                  {item.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>

              {/* name + email with bottom border like index */}
              <View style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderBottomColor: '#e5e5ea',
                paddingVertical: 10,
                minHeight: 72,
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
                  {item.username}
                </Text>
                <Text style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
                  {item.email}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <FontAwesome name="users" size={40} color="#e2e8f0" />
              <Text style={{ color: '#8E8E93', fontSize: 15 }}>
                {search ? 'No users found' : 'No users yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}