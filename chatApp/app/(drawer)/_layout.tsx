import { Drawer } from 'expo-router/drawer';

const DrawerLayout = () => {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,        // hide drawer's own header — tabs handle their own
        drawerType: 'slide',
        swipeEnabled: false,       // disable swipe-to-open so it doesn't conflict with chat gestures
        drawerStyle: {
          width: 0,                // effectively hides the drawer — you're using tabs for nav
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
    </Drawer>
  );
};

export default DrawerLayout;