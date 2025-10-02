import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tabs = [
  { key: 'dashboard', label: 'Home', icon: 'home', route: '/dashboard' },
  { key: 'users', label: 'Users', icon: 'account', route: '/users' },
  { key: 'qrcodes', label: 'QR', icon: 'qrcode', route: '/qrcodes' },
  { key: 'notifications', label: 'Bell', icon: 'bell', route: '/notifications' },
];

export default function TabBar({ activeTab }) {
  const router = useRouter();
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={[
            styles.tabItem,
            { backgroundColor: activeTab === tab.key ? 'rgba(108, 99, 181, 0.15)' : 'transparent' }
          ]}
          onPress={() => router.replace(tab.route)}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={activeTab === tab.key ? '#6c63b5' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.key ? '#6c63b5' : '#666' }
          ]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
