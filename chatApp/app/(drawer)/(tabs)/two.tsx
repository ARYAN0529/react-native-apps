import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useStore } from '@/store/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ───────────────────────────────────────────────────────────────────
type SettingsRowProps = {
  icon: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
};

// ─── SettingsRow sub-component ───────────────────────────────────────────────
function SettingsRow({
  icon,
  iconBg,
  label,
  sublabel,
  onPress,
  isLast = false,
  danger = false,
}: SettingsRowProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.row, !isLast && styles.rowBorder]}
      >
        {/* Coloured icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
          <FontAwesome
            name={icon as any}
            size={15}
            color="#fff"
          />
        </View>

        {/* Labels */}
        <View style={styles.rowTextWrap}>
          <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
          {sublabel ? (
            <Text style={styles.rowSublabel}>{sublabel}</Text>
          ) : null}
        </View>

        {/* Chevron */}
        {!danger && (
          <FontAwesome name="chevron-right" size={12} color="#c7c7cc" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { user, setUser } = useStore();
  const insets = useSafeAreaInsets();

  // Avatar pulse animation on mount
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    if (!user) fetchUser();
  }, []);

  async function fetchUser() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
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

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
        },
      },
    ]);
  }

  const initials = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Gradient-like Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
            <Text style={styles.avatarText}>{initials}</Text>

            {/* Online dot */}
            <View style={styles.onlineDot} />
          </Animated.View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.username ?? 'Loading…'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>

          {/* Edit shortcut */}
          <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
            <FontAwesome name="pencil" size={13} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* ── Section: Account ── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="user"
            iconBg="#3b82f6"
            label="Edit Profile"
            sublabel="Change name, avatar & bio"
          />
          <SettingsRow
            icon="shield"
            iconBg="#8b5cf6"
            label="Privacy"
            sublabel="Manage who can see you"
          />
          <SettingsRow
            icon="lock"
            iconBg="#f59e0b"
            label="Security"
            sublabel="Password, 2FA"
            isLast
          />
        </View>

        {/* ── Section: Preferences ── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="bell"
            iconBg="#ef4444"
            label="Notifications"
            sublabel="Sounds, badges & alerts"
          />
          <SettingsRow
            icon="paint-brush"
            iconBg="#10b981"
            label="Appearance"
            sublabel="Dark mode, font size"
          />
          <SettingsRow
            icon="globe"
            iconBg="#06b6d4"
            label="Language"
            sublabel="English"
            isLast
          />
        </View>

        {/* ── Section: Support ── */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="question-circle"
            iconBg="#64748b"
            label="Help & FAQ"
          />
          <SettingsRow
            icon="envelope"
            iconBg="#0ea5e9"
            label="Contact Us"
            isLast
          />
        </View>

        {/* ── Logout ── */}
        <View style={[styles.card, { marginTop: 24 }]}>
          <SettingsRow
            icon="sign-out"
            iconBg="#ef4444"
            label="Sign Out"
            onPress={handleLogout}
            isLast
            danger
          />
        </View>

        {/* ── Version ── */}
        <Text style={styles.versionText}>ChatApp · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },

  scroll: { flex: 1 },

  // Profile card
  profileCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    // subtle inner glow via shadow
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
  editBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Section label
  sectionLabel: {
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f5',
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  rowSublabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  dangerText: {
    color: '#ef4444',
  },

  // Version
  versionText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 28,
    letterSpacing: 0.3,
  },
});