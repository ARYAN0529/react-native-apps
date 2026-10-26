
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  username: string;
};

const AVATAR_COLORS = [
  '#2AABEE',
  '#E91E63',
  '#9C27B0',
  '#FF9800',
  '#4CAF50',
  '#F44336',
  '#00BCD4',
];

function getAvatarColor(name: string) {
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
      setFiltered(
        users.filter((user) =>
          user.username.toLowerCase().includes(query)
        )
      );
    }
  }, [search, users]);

  async function fetchUsers() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      const { data: existing, error } = await supabase.rpc(
        'find_conversation',
        {
          other_user_id: other.id,
        }
      );

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
        params: {
          id: 'new',
          userId: other.id,
          username: other.username,
        },
      });
    } catch (error) {
      console.log('startConversation error:', error);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top,
      }}
    >
      {/* Hide navigation header and back arrow */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Minimal Search Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            paddingHorizontal: 14,
            backgroundColor: '#F2F3F5',
            borderRadius: 24,
          }}
        >
          <FontAwesome
            name="search"
            size={16}
            color="#747881"
          />

          <TextInput
            style={{
              flex: 1,
              marginLeft: 10,
              paddingVertical: 0,
              fontSize: 15,
              color: '#111318',
            }}
            placeholder="Search"
            placeholderTextColor="#8B9099"
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <FontAwesome
                name="times-circle"
                size={17}
                color="#8B9099"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator
            size="small"
            color="#2AABEE"
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filtered.length === 0
              ? {
                  flexGrow: 1,
                  paddingHorizontal: 16,
                }
              : {
                  paddingBottom: 20,
                }
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.65}
              onPress={() => startConversation(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 16,
                minHeight: 76,
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: getAvatarColor(item.username),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 13,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 21,
                    fontWeight: '700',
                  }}
                >
                  {item.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>

              {/* Username */}
              <View
                style={{
                  flex: 1,
                  minHeight: 76,
                  justifyContent: 'center',
                  paddingRight: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#ECEDEF',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#17181C',
                  }}
                  numberOfLines={1}
                >
                  {item.username}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: 50,
              }}
            >
              <FontAwesome
                name={search.trim() ? 'search' : 'users'}
                size={32}
                color="#C7CBD1"
              />

              <Text
                style={{
                  marginTop: 14,
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#25272C',
                }}
              >
                {search.trim() ? 'No results found' : 'No users yet'}
              </Text>

              {search.trim().length > 0 && (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#8B9099',
                  }}
                >
                  Try another username.
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
