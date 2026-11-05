import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// route name -> label + icon (add more tabs here)
const TABS: Record<string, { label: string; icon: any }> = {
  index: { label: 'Chats', icon: 'commenting' },
  two: { label: 'Settings', icon: 'gear' },
};

function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  // keeps the bar above the phone's gesture/home area
  const insets = useSafeAreaInsets();

  return (
    // wrapper only centers the pill; box-none lets touches pass through the empty sides
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 6,
        alignItems: 'center',
      }}
    >
      {/* warm white pill, matches your cards */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 4,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
          // soft, low shadow so it floats without looking heavy
          shadowColor: '#3D2B12',
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null; // skip routes we didn't define
          const focused = state.index === i;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                // standard tab-press handling so Expo Router stays in sync
                const e = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
              }}
              style={{
                // icon and label side by side = much shorter bar
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                height: 40,
                paddingHorizontal: focused ? 16 : 14,
                borderRadius: 20,
                // warm amber tint behind the active tab
                backgroundColor: focused ? 'rgba(245,158,11,0.14)' : 'transparent',
              }}
            >
              <FontAwesome
                name={tab.icon}
                size={18}
                color={focused ? '#E08A00' : '#9A948D'}
              />
              {/* label only on the active tab, inactive = icon only */}
              {focused && (
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#E08A00' }}>
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    // hand Expo Router our custom bar instead of the default one
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="two" />
    </Tabs>
  );
}