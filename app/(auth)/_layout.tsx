//security gate  and it is parent and all other files are child 

import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        < Stack screenOptions={{ headerShown : false }} />
    );
}
