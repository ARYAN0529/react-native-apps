import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system'; // reads the local photo file
import { decode } from 'base64-arraybuffer'; // base64 text -> raw bytes
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

  // creates the account, then uploads the photo (if any) to Supabase storage
  async function handleFinish() {
    setLoading(true);

    // 1. create the account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error || !data.user) {
      setLoading(false);
      Alert.alert('Registration failed', error?.message ?? 'Something went wrong');
      return;
    }

    // 2. upload the photo only if one was picked AND we have a session
    if (avatarUri && data.session) {
      try {
        // read the file as base64, then convert to bytes
        // (fetch().arrayBuffer() gave a corrupt file on React Native)
        const base64 = await new File(avatarUri).base64();
        const bytes = decode(base64);

        // folder name = user id, this is what the storage policy checks
        const path = `${data.user.id}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) throw uploadError;

        // save the public url on the profile row
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ avatar_url: pub.publicUrl })
          .eq('id', data.user.id);
        if (profileError) throw profileError;
      } catch (e) {
        // account already exists, so don't block signup over a photo
        console.log('avatar upload error:', e);
      }
    } else if (avatarUri && !data.session) {
      console.log('No session after signUp: email confirmation is on, photo not uploaded');
    }

    setLoading(false);
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