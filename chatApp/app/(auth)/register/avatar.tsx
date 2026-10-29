import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AuthScreen from '@/components/auth/AuthScreen';
import { useRegisterStore } from '@/store/registerStore';
import { supabase } from '@/utils/supabase';

export default function AvatarStep() {
  const { username, email, password, avatarUri, setDraft, reset } = useRegisterStore();
  const [loading, setLoading] = useState(false);

  // open the gallery, crop to a square, keep the chosen uri in the draft
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setDraft({ avatarUri: result.assets[0].uri });
  }

  // the only place we talk to Supabase: create the account with everything collected
  async function handleFinish() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    // TODO (backend, later): upload avatarUri to storage and save its url on the profile

    setLoading(false);

    if (error) {
      Alert.alert('Registration failed', error.message);
      return;
    }
    reset(); // the root layout's auth listener redirects to the chats tab
  }

  return (
    <AuthScreen
      title="Add a profile photo"
      subtitle="Help your friends recognize you. You can skip this."
      buttonLabel={avatarUri ? 'Create account' : 'Skip & create account'}
      accent
      loading={loading}
      onNext={handleFinish}
    >
      <View className="items-center pt-6">
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View className="h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[#E8E8E6]">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="h-full w-full" />
            ) : (
              <Text className="text-6xl font-bold text-gray-400">
                {username[0]?.toUpperCase() ?? '?'}
              </Text>
            )}
          </View>

          {/* small camera badge on the corner of the circle */}
          <View className="absolute bottom-1 right-1 h-11 w-11 items-center justify-center rounded-full border-4 border-[#FDFCF7] bg-[#FF5A00]">
            <FontAwesome name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>

        <Text className="mt-4 text-sm text-gray-500">
          {avatarUri ? 'Tap to change' : 'Tap to choose a photo'}
        </Text>
      </View>
    </AuthScreen>
  );
}