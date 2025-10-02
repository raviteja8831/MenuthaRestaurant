import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function FilterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <Text style={styles.title}>Filter</Text>
        <Text style={styles.option}>Near Me (1km)</Text>
        <Text style={styles.option}>Veg Only</Text>
        <Text style={styles.option}>Non-Veg Only</Text>
        <Text style={styles.option}>Rating 4+</Text>
        <Text style={styles.option}>Open Now</Text>
        <Text style={styles.option}>Family Friendly</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7', justifyContent: 'center', alignItems: 'center' },
  filterBox: {
    backgroundColor: '#e0c3fc',
    borderRadius: 20,
    padding: 30,
    width: 250,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  option: { fontSize: 16, marginBottom: 10, color: '#333' },
});
