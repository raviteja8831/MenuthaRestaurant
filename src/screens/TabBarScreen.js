import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tabs = [
  { key: 'dashboard', label: 'Home', icon: 'home-outline', route: '/dashboard' },
  { key: 'users', label: 'Users', icon: 'account-outline', route: '/users' },
  { key: 'qrcodes', label: 'Barcode', icon: 'barcode-scan', route: '/qrcodes' },
  { key: 'notifications', label: 'Notifications', icon: 'bell-outline', route: '/notifications' },
];

export default function TabBar({ activeTab }) {
  const router = useRouter();
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={styles.tabItem}
          onPress={() => router.replace(tab.route)}
        >
          <View style={[
            styles.iconContainer,
            activeTab === tab.key && styles.iconContainerActive
          ]}>
            <MaterialCommunityIcons
              name={activeTab === tab.key ? tab.icon.replace('-outline', '') : tab.icon}
              size={26}
              color={activeTab === tab.key ? '#000' : '#000'}
            />
          </View>
          {/* <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.key ? '#6c63b5' : '#000' }
          ]}>
            {tab.label}
          </Text> */}
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
    paddingVertical: 10,
    paddingBottom: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
   
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(108, 99, 181, 0.1)',
    borderWidth: 3,
    borderColor: '#6c63b5',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 5,
  },
});
