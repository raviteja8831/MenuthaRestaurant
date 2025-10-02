import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function FooterMenu() {
  return (
    <View style={styles.footer}>
      {/* Replace with your actual menu icons/buttons */}
      <Text style={styles.menuText}>Menu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    backgroundColor: '#8D8BEA',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  menuText: {
    color: '#4b3c6e',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});
