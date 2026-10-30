import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  username: string;
};

// Pastel avatar pairs, same as the other screens
const AVATAR_COLORS = [
  { bg: '#E6F4FD', fg: '#2AABEE' },
  { bg: '#FDE8F0', fg: '#E91E63' },
  { bg: '#F3E8FA', fg: '#9C27B0' },
  { bg: '#FFF4E3', fg: '#F59E0B' },
  { bg: '#E8F5E9', fg: '#4CAF50' },
  { bg: '#FDECEC', fg: '#E5484D' },
  { bg: '#E0F7FA', fg: '#00ACC1' },
];

function getAvatarColor(name: string) {
  // same name always maps to the same color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setFiltered(users);
    } else {
      setFiltered(users.filter((user) => user.username.toLowerCase().includes(query)));
    }
  }, [search, users]);

  async function fetchUsers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', user.id)
        .order('username', { ascending: true });

      if (error) {
        console.log('fetchUsers error:', error);
        return;
      }
      setUsers(data || []);
    } catch (error) {
      console.log('Unexpected fetchUsers error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startConversation(other: Profile) {
    try {
      const { data: existing, error } = await supabase.rpc('find_conversation', {
        other_user_id: other.id,
      });

      if (error) {
        console.log('find_conversation error:', error);
        return;
      }

      if (existing) {
        router.replace(`/chat/${existing}`);
        return;
      }

      router.replace({
        pathname: '/chat/[id]',
        params: { id: 'new', userId: other.id, username: other.username },
      });
    } catch (error) {
      console.log('startConversation error:', error);
    }
  }

  return (
    // Same warm background as the other screens
    <View style={{ flex: 1, backgroundColor: '#F7F7F5', paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Search: soft rounded pill, same as your original */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            paddingHorizontal: 16,
            backgroundColor: '#EDEDE9',
            borderRadius: 24,
          }}
        >
          <FontAwesome name="search" size={16} color="#9A9A95" />

          <TextInput
            style={{ flex: 1, marginLeft: 10, paddingVertical: 0, fontSize: 15, color: '#222' }}
            placeholder="Search"
            placeholderTextColor="#9A9A95"
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10} activeOpacity={0.7}>
              <FontAwesome name="times-circle" size={17} color="#B5B5B0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#2AABEE" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filtered.length === 0
              ? { flexGrow: 1, paddingHorizontal: 16 }
              : { paddingBottom: 20 }
          }
          renderItem={({ item }) => {
            const color = getAvatarColor(item.username);
            return (
              <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => startConversation(item)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, minHeight: 76 }}
              >
                {/* Avatar */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: color.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 13,
                  }}
                >
                  <Text style={{ color: color.fg, fontSize: 21, fontWeight: '600' }}>
                    {item.username?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>

                {/* Username + thin line under it, like your original */}
                <View
                  style={{
                    flex: 1,
                    minHeight: 76,
                    justifyContent: 'center',
                    paddingRight: 16,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#E8E8E4',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#222' }} numberOfLines={1}>
                    {item.username}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 }}>
              <FontAwesome name={search.trim() ? 'search' : 'users'} size={32} color="#C4C4C0" />
              <Text style={{ marginTop: 14, fontSize: 16, fontWeight: '500', color: '#222' }}>
                {search.trim() ? 'No results found' : 'No users yet'}
              </Text>
              {search.trim().length > 0 && (
                <Text style={{ marginTop: 6, fontSize: 14, color: '#9A9A95' }}>Try another username.</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}