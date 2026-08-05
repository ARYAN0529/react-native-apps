import { View, Text, Image } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { HOME_USER, HOME_BALANCE } from "@/constants/data";

// format date helper
const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function Profile() {
    return (
        <SafeAreaView className='flex-1 bg-gray-50 px-5 pt-4'>

            {/* ── Header row ── */}
            <View className='flex-row items-center gap-4 mb-8'>
                <Image
                    source={require('@/assets/images/ja2.jpg')}
                    className="w-14 h-14 rounded-full"
                />
                <View className='flex-1'>
                    <Text className='text-xs text-gray-400 mb-0.5'>Welcome back</Text>
                    <Text className='text-lg font-semibold text-gray-900'>{HOME_USER.name}</Text>
                </View>
                <Ionicons name="notifications-outline" size={24} color="#9ca3af" />
            </View>

            {/* ── Balance card ── */}
            <View className='bg-white rounded-2xl p-6 mb-4'
                style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
                <Text className='text-xs text-gray-400 uppercase tracking-widest mb-2'>Total Balance</Text>
                <Text className='text-4xl font-bold text-gray-900 mb-1'>
                    ₹{HOME_BALANCE.amount.toLocaleString('en-IN')}
                </Text>
                <View className='flex-row items-center gap-1 mt-3 pt-3 border-t border-gray-100'>
                    <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                    <Text className='text-xs text-gray-400'>
                        Renews on {formatDate(HOME_BALANCE.nextRenewaldate)}
                    </Text>
                </View>
            </View>

            {/* ── Quick stats row ── */}
            <View className='flex-row gap-3 mb-4'>
                <View className='flex-1 bg-white rounded-2xl p-4'
                    style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
                    <Ionicons name="arrow-up-circle-outline" size={22} color="#10b981" />
                    <Text className='text-xs text-gray-400 mt-2'>Income</Text>
                    <Text className='text-base font-semibold text-gray-900'>₹4,200</Text>
                </View>
                <View className='flex-1 bg-white rounded-2xl p-4'
                    style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
                    <Ionicons name="arrow-down-circle-outline" size={22} color="#f43f5e" />
                    <Text className='text-xs text-gray-400 mt-2'>Expense</Text>
                    <Text className='text-base font-semibold text-gray-900'>₹1,600</Text>
                </View>
            </View>

            {/* ── Menu items ── */}
            {[
                { icon: 'person-outline',   label: 'Edit Profile' },
                { icon: 'card-outline',     label: 'Payment Methods' },
                { icon: 'shield-outline',   label: 'Privacy & Security' },
                { icon: 'log-out-outline',  label: 'Log Out', danger: true },
            ].map((item) => (
                <View key={item.label}
                    className='flex-row items-center gap-4 bg-white px-4 py-4 rounded-2xl mb-2'
                    style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                    <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.danger ? '#f43f5e' : '#6b7280'}
                    />
                    <Text className={`flex-1 text-sm font-medium ${item.danger ? 'text-rose-500' : 'text-gray-700'}`}>
                        {item.label}
                    </Text>
                    {!item.danger && <Ionicons name="chevron-forward" size={16} color="#d1d5db" />}
                </View>
            ))}

        </SafeAreaView>
    )
}