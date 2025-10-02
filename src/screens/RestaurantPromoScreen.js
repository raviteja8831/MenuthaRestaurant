import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function RestaurantPromoScreen() {
  const [promo, setPromo] = useState('');
  const [announcement, setAnnouncement] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Restaurant Promo"
        placeholderTextColor="#fff"
        value={promo}
        onChangeText={setPromo}
      />
      <TextInput
        style={styles.input}
        placeholder="Announcement / Notice"
        placeholderTextColor="#fff"
        value={announcement}
        onChangeText={setAnnouncement}
      />
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b6a6e7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: '#a18cd1',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7b6eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
