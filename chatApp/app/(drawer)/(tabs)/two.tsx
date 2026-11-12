import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useStore } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// settings tab

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string; // icon color
  tileBg: string; // soft background behind the icon
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
};

// One reusable row. Single root view, divider lives inside it.
function Row({ icon, label, tint, tileBg, onPress, isLast, danger }: RowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.rowWrap}>
      <View style={styles.row}>
        <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#E5484D' }]}>{label}</Text>
        {!danger && <Ionicons name="chevron-forward" size={18} color="#C4C4C0" />}
      </View>
      {/* inset divider: starts under the label, hidden on the last row */}
      {!isLast && <View style={styles.divider} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, setUser } = useStore();
  const insets = useSafeAreaInsets();

  // load the user if the store is empty
  useEffect(() => {
    if (!user) fetchUser();
  }, []);

  async function fetchUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email, avatar_url')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser({
        id: authUser.id,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatar_url, // needs avatarUrl?: string | null in store.ts
      });
    }
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
        },
      },
    ]);
  }


function handleDeleteAccount() {
  Alert.alert(
    'Delete Account',
    'This permanently deletes your account and profile. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;

          // remove the photo first, while we're still logged in
          await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);

          // delete the account via the SQL function
          const { error } = await supabase.rpc('delete_my_account');
          if (error) {
            Alert.alert('Could not delete account', error.message);
            return;
          }

          // clear the local session, your auth listener sends you to login
          await supabase.auth.signOut();
          setUser(null);
        },
      },
    ]
  );
}




  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        {/* invisible spacer, same width as the back button, keeps the title centered */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card: tap to open edit profile */}
        <TouchableOpacity
          style={[styles.card, styles.profileCard]}
          activeOpacity={0.7}
          onPress={() => router.push('/edit-profile')}
        >
          {/* photo if the user has one, otherwise the first letter */}
          <View style={styles.avatar}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImg}
                onError={(e) => console.log('img error:', e.nativeEvent.error, user.avatarUrl)}
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.username ?? 'Loading…'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4C4C0" />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Support & Legal</Text>
        <View style={styles.card}>
          <Row icon="ban-outline" label="Blocked Users" tint="#F59E0B" tileBg="#FFF4E3" />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" tint="#3B82F6" tileBg="#EAF2FE" isLast />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Row icon="log-out-outline" label="Log Out" tint="#6B7280" tileBg="#F1F1EE" onPress={handleLogout} />
          <Row icon="trash-outline" label="Delete Account" tint="#E5484D" tileBg="#FDECEC" danger isLast onPress={handleDeleteAccount} />
        </View>

        <Text style={styles.version}>Version 1.0.1</Text>
      </ScrollView>
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
  // white circle with a hairline border (no elevation, no Android shadow quirks)
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

  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
    marginHorizontal: 26,
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A95',
    letterSpacing: 0.3,
  },

  // card: border instead of shadow, so overflow hidden is safe
  card: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E0',
    overflow: 'hidden',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 12,
  },
  // bigger photo: 76 wide, borderRadius = half of that for a perfect circle
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden', // clips the photo to the circle
  },
  avatarImg: { width: 76, height: 76 },
  avatarText: { fontSize: 30, fontWeight: '600', color: '#F59E0B' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#222' },
  profileEmail: { fontSize: 13, color: '#9A9A95', marginTop: 2 },

  rowWrap: { backgroundColor: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '400', color: '#222' },
  // 66 = row padding (16) + icon tile (36) + gap (14)
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E8E8E4', marginLeft: 66 },

  version: { textAlign: 'center', marginTop: 28, fontSize: 13, color: '#B5B5B0' },
});