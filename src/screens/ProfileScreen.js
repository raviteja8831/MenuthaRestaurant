import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, Avatar, useTheme, Divider } from 'react-native-paper';

export default function ProfileScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Card style={styles.profileHeader}>
        <Card.Content style={{ alignItems: 'center' }}>
          <Avatar.Icon size={90} icon="account" style={styles.avatar} color={theme.colors.primary} />
          <Title style={styles.name}>Test Name: Customer</Title>
          <Paragraph style={styles.info}>Mobile: 9000000000</Paragraph>
          <Paragraph style={styles.info}>Member since: 2024-01-01</Paragraph>
        </Card.Content>
      </Card>
      <Section title="Order History">
        <OrderRow item="Tomato Soup" qty="4" price="₹80" />
        <OrderRow item="Roti Manchurian" qty="2" price="₹150" />
        <OrderRow item="Rice Platter" qty="1" price="₹250" />
      </Section>
      <Section title="Feedback">
        <Text>⭐⭐⭐⭐⭐</Text>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  const theme = useTheme();
  return (
    <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}> 
      <Card.Content>
        <Paragraph style={styles.sectionTitle}>{title}</Paragraph>
        <Divider style={{ marginBottom: 8 }} />
        {children}
      </Card.Content>
    </Card>
  );
}

function OrderRow({ item, qty, price }) {
  return (
    <Card.Content style={styles.orderRow}>
      <Text>{item}</Text>
      <Text>{qty}</Text>
      <Text>{price}</Text>
    </Card.Content>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    marginHorizontal: 10,
    marginTop: 10,
  },
  avatar: {
    marginBottom: 15,
    backgroundColor: '#e0c3fc',
  },
  name: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  info: { marginBottom: 5, textAlign: 'center' },
  section: { margin: 20, borderRadius: 15 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
});
