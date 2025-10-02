import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, Surface, Title, Button } from 'react-native-paper';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';
import { fetchChefMenu } from '../api/chefApi';
import { showApiError } from '../services/messagingService';

export default function ChefMenuScreen({ navigation }) {
  const theme = useTheme();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchChefMenu();
        setMenuItems(data.items || []);
      } catch (err) {
        showApiError(err);
      }
    };
    loadMenu();
  }, []);

    return (
      <>
        <Header title={getHeading('ChefMenuScreen')} />
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
          <Title style={styles.title}>Menu</Title>
          <Surface style={styles.menuGrid}>
            {menuItems.map((item, i) => (
              <Card
                key={i}
                style={[styles.menuBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => item.name === 'Add' ? navigation.navigate('AddMenuItem') : null}
              >
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.name}</Text>
                </Card.Content>
              </Card>
            ))}
          </Surface>
        </ScrollView>
      </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', backgroundColor: 'transparent', elevation: 0 },
  menuBtn: { width: '30%', borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center' },
  menuIcon: { fontSize: 32, marginBottom: 10, color: '#fff' },
  menuLabel: { color: '#fff', fontWeight: 'bold' },
});

