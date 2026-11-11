import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useStore } from '@/store/store';

export default function EditProfile() {
  const { user, setUser } = useStore();
  const insets = useSafeAreaInsets();

  // newUri = photo picked locally but not uploaded yet
  const [newUri, setNewUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // show the new pick if there is one, else the saved photo
  const shown = newUri ?? user?.avatarUrl ?? null;
  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  // open gallery, square crop (same settings as signup)
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setNewUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!newUri || !user) return;
    setSaving(true);
    try {
      // file -> base64 -> bytes (fetch().arrayBuffer() corrupts files on RN)
      const base64 = await new File(newUri).base64();
      const bytes = decode(base64);

      // same path every time + upsert = the old photo gets replaced
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;

      // url never changes (same path), so add ?t= to stop the app showing the cached old image
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // update the store so Settings shows the new photo instantly
      setUser({ ...user, avatarUrl: url });
      router.back();
    } catch (e: any) {
      Alert.alert('Could not update photo', e?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* turns off the default header so only our custom one shows */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        {/* spacer keeps the title centered */}
        <View style={{ width: 40 }} />     
 </View>

      <View style={styles.center}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.avatar}>
            {shown ? (
              <Image source={{ uri: shown }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          {/* camera badge */}
          <View style={styles.badge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.hint}>Tap to change photo</Text>
      </View>

      {/* Save only works after a new photo is picked */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          style={[styles.saveBtn, !newUri && { opacity: 0.4 }]}
          disabled={!newUri || saving}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#222' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFF1DB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // clips the photo to a circle
  },
  avatarImg: { width: 160, height: 160 },
  avatarText: { fontSize: 64, fontWeight: '600', color: '#F59E0B' },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E08A00',
    borderWidth: 4,
    borderColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { marginTop: 16, fontSize: 14, color: '#9A9A95' },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E08A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});