import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
