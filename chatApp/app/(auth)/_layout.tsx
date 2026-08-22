//security gate  and it is parenet and all other files are child 

import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        < Stack screenOptions={{ headerShown : false }} />
    );
}
