import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const tabs = [
  { name: 'chats',   label: 'Chats',    icon: 'chatbubbles-outline' },
  { name: 'profile', label: 'Profile',  icon: 'person-outline' },
  { name: 'settings',label: 'Settings', icon: 'settings-outline' },
];

function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const tab = tabs.find(t => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, isFocused && styles.activeItem]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={isFocused ? '#a78bfa' : '#888'}
              />
              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',   // ← centers the bar horizontally
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(215, 215, 255, 0.95)',
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 12,  // ← controls side padding inside bar
    gap: 4,                 // ← spacing between tab items
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,  // ← controls width of each tab item
    borderRadius: 24,
    gap: 3,
  },
  activeItem: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
  },
  label: {
    fontSize: 10,
    color: '#888',
    fontWeight: '400',
  },
  activeLabel: {
    color: '#a78bfa',
    fontWeight: '600',
  },
});

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <MyTabBar {...props} />}>
      <Tabs.Screen name="chats"    options={{ headerShown: false, title: 'Chats' }} />
      <Tabs.Screen name="profile"  options={{ headerShown: false, title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ headerShown: false, title: 'Settings' }} />
    </Tabs>
  );
}