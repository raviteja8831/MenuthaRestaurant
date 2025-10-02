import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function GlobalAlert({ visible, type, message }) {
  if (!visible) return null;
  let bgColor = '#7b6eea';
  if (type === 'error') bgColor = '#e57373';
  if (type === 'success') bgColor = '#81c784';
  if (type === 'info') bgColor = '#64b5f6';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}> 
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
