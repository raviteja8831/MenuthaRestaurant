import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { fetchManagedUsers } from '../api/managerApi';
import { showApiError } from '../services/messagingService';

export default function UsersListScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchManagedUsers();
        setUsers(data.users || []);
      } catch (err) {
        showApiError(err);
      }
    };
    loadUsers();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <View style={styles.avatarRow}>
        {users.map((u, i) => (
          <View key={i} style={styles.avatar} />
        ))}
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddUser')}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>
      {users.map((u, i) => (
        <View key={i} style={styles.userCard}>
          <Text style={styles.userName}>{u.name}</Text>
          <Text style={styles.userRole}>{u.role}</Text>
          <Text style={styles.userStats}>Orders: {u.orders} | Stats: {u.stats}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0c3fc', marginRight: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7b6eea', alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#fff', fontSize: 24 },
  userCard: { backgroundColor: '#a18cd1', borderRadius: 15, padding: 15, marginBottom: 10 },
  userName: { fontWeight: 'bold', color: '#fff', fontSize: 18 },
  userRole: { color: '#fff', marginBottom: 5 },
  userStats: { color: '#fff' },
});
