import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useStore } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//setting page
// edit profile is not created 

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string; // icon color
  tileBg: string; // soft background behind the icon
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
};

// One reusable row. It returns a single root view (no Fragment),
// and the divider lives inside it, so every row is one self-contained block.
function Row({ icon, label, tint, tileBg, onPress, isLast, danger }: RowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.rowWrap}>
      <View style={styles.row}>
        {/* Fixed background colors instead of "hex + 1A" opacity tricks, which are less reliable */}
        <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#E5484D' }]}>{label}</Text>
        {!danger && <Ionicons name="chevron-forward" size={18} color="#C4C4C0" />}
      </View>
      {/* Inset divider: starts under the label, hidden on the last row */}
      {!isLast && <View style={styles.divider} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, setUser } = useStore();
  const insets = useSafeAreaInsets();

  // Same logic as your original: load the user if the store is empty
  useEffect(() => {
    if (!user) fetchUser();
  }, []);

  async function fetchUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser({ id: authUser.id, username: profile.username, email: profile.email });
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

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        {/* Spacer, same width as back button, keeps the title centered */}
        <View style={styles.backBtn} />
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
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
          <Row icon="trash-outline" label="Delete Account" tint="#E5484D" tileBg="#FDECEC" danger isLast />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
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
  // Plain white circle with a hairline border (no elevation, so no Android shadow quirks)
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

  // Card: border instead of shadow. overflow hidden is now safe because there's no elevation on this view.
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF1DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '600', color: '#F59E0B' },
  profileName: { fontSize: 17, fontWeight: '600', color: '#222' },
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