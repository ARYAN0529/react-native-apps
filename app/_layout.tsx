import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack  , router} from 'expo-router';

import { useEffect } from 'react';
import {supabase} from '@/utils/supabase' ; 


export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <Stack>
//           <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
//           <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
//         </Stack>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }


export default function RootLayout(){
    useEffect ( () => {                               // when the application start 
        //check session on app start 
        supabase.auth.getSession().then(({data : {session }}) => {          //"Do we currently have a logged-in session?"
                                                                  //  getsession -> "What is the authentication state right now?"
            if (session){
                router.replace('/(drawer)/(tabs)') ;   // already login 
            } else {
                router.replace('/(auth)/login')   // if not login
            }
        });

        // listen for login and logout ,session expire      "Tell me whenever the authentication state changes."
            const { data : {subscription}} = supabase.auth.onAuthStateChange ((_event , session) => {
                if (session) {
                    router.replace('/(drawer)/(tabs)');
                }else {
                    router.replace('/(auth)/login');
                }
            });

            return () =>subscription.unsubscribe();
    },[]);

    //safeareaprovider -> Phones have areas where your app shouldn't place content: ex -> phone notch , dynamic island 
    //gestureHandler -> this is need for features that use gesture such as -> swipe , drag

    return(
         <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>


    );

}