import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';


// defining profile isme ye propery hone ccheye
type Profile = {
  id: string;
  username: string;
  email: string;
};

export default function UsersScreen() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users as you type
  useEffect(() => {
    if (search === '') {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(u =>                 // go throungh evey user that satisfy this condition
          u.username.toLowerCase().includes(search.toLowerCase()) ||    // convert kar raha hai user ke input ko lowercase mai
          u.email.toLowerCase().includes(search.toLowerCase())              // email ko
        )
      );
    }
  }, [search, users]);


                         // backend start 
  async function fetchUsers() {
    const { data: { user } } = await supabase.auth.getUser();   // current userr kon hai 
    //console.log('current user:', user); // check if logged in

    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email')
      .neq('id', user.id);          // neq -> not equal to  // give me id that are not my id

    //console.log('users data:', data);  
    //console.log('users error:', error); 

    setUsers(data || []);
    setFiltered(data || []);
    setLoading(false);           // loading finish
  }





  async function startConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();           // 

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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <FontAwesome name="search" size={16} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by username or email..."
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <FontAwesome name="times" size={16} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 py-4 border-b border-gray-100 flex-row items-center"
            onPress={() => startConversation(item.id)}
          >
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-blue-500 justify-center items-center mr-3">
              <Text className="text-white font-bold text-lg">
                {item.username[0].toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View>
              <Text className="font-semibold text-base">{item.username}</Text>
              <Text className="text-gray-500 text-sm">{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400">
              {search ? 'No users found' : 'No users yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}