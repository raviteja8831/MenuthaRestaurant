import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const transactions = [
  { order: 'Order1', date: '2025-08-01', time: '10:00', price: '₹250' },
  { order: 'Order2', date: '2025-08-01', time: '11:00', price: '₹150' },
  // ...more rows
];

export default function ChefTransactionScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QR Code Generator / Statistics</Text>
      <Text style={styles.subtitle}>Table 1</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.th}>Order</Text>
        <Text style={styles.th}>Date</Text>
        <Text style={styles.th}>Time</Text>
        <Text style={styles.th}>Price</Text>
      </View>
      {transactions.map((t, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.td}>{t.order}</Text>
          <Text style={styles.td}>{t.date}</Text>
          <Text style={styles.td}>{t.time}</Text>
          <Text style={styles.td}>{t.price}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b6a6e7',
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    marginTop: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    fontWeight: '600'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#a18cd1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4
  },
  th: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    fontSize: 14
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e0c3fc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 4
  },
  td: {
    color: '#000',
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '400'
  },
});
