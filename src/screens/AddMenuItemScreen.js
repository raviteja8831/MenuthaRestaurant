import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { getMenusWithItems } from '../api/menuApi';



export default function AddMenuItemScreen({ visible, onClose, onSave }) {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [menus, setMenus] = useState([]);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const userProfile = await AsyncStorage.getItem('user_profile');
        const parsed = JSON.parse(userProfile || '{}');
        const restaurantId = parsed?.restaurant?.id;
        if (!restaurantId) return;
        const data = await getMenusWithItems(restaurantId);
        // data should be an array of menus
        setMenus(data || []);
      } catch (err) {
        // ignore for now; menu list will remain empty
        console.error('Failed to load menus', err);
      }
    };

    if (visible) loadMenus();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalCard}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={28} color="#222" />
            </Pressable>
            <Text style={styles.modalTitle}>Add Menu Item</Text>
            {/* Menu Picker */}
            <Text style={styles.label}>Menu</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMenuId}
                onValueChange={(itemValue) => setSelectedMenuId(itemValue)}
                style={styles.picker}
                dropdownIconColor="#222"
                mode="dropdown"
              >
                <Picker.Item label="Select menu" value="" />
                {menus.map((m) => (
                  <Picker.Item key={m.id} label={m.name} value={m.id} />
                ))}
              </Picker>
            </View>
          {/* Type */}
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Veg/Non-Veg"
            value={type}
            onChangeText={setType}
            placeholderTextColor="#888"
          />
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
          {/* Price */}
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <Pressable style={styles.saveBtn} onPress={() => {
            if (!selectedMenuId) return alert('Please select a Menu');
            const payload = { menuId: selectedMenuId, type, name, price };
            onSave && onSave(payload);
            onClose && onClose();
          }}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: '#d6d1f7',
    borderRadius: 24,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 10,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0c9f5',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#222',
    backgroundColor: 'transparent',
  },
  input: {
    width: '100%',
    minHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#7b6eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
