import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMenusWithItems } from '../api/menuApi';



export default function AddMenuItemScreen({ visible, onClose, onSave }) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menus, setMenus] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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
        <View style={styles.modalCard}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#222" />
          </Pressable>
          <Text style={styles.modalTitle}>Add Menu Item</Text>
          {/* Category Dropdown */}
          <Text style={styles.label}>Menu</Text>
          <Pressable style={styles.dropdown} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
            <Text style={styles.dropdownText}>{
              menus.find(m => m.id === selectedMenuId)?.name || 'Select menu'
            }</Text>
            <MaterialCommunityIcons name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} size={24} color="#222" />
          </Pressable>
          {showCategoryDropdown && (
            <View style={styles.dropdownMenu}>
              <Text style={styles.dropdownMenuTitle}>Menu</Text>
              {menus.map((m) => (
                <Pressable key={m.id} style={styles.dropdownMenuItem} onPress={() => { setSelectedMenuId(m.id); setShowCategoryDropdown(false); }}>
                  <Text style={styles.dropdownMenuItemText}>• {m.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
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
  modalCard: {
    backgroundColor: '#d6d1f7',
    borderRadius: 24,
    padding: 24,
    width: 320,
    alignItems: 'center',
    alignSelf: 'center',
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ece9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 8,
  },
  dropdownText: {
    color: '#222',
    fontSize: 15,
  },
  dropdownMenu: {
    backgroundColor: '#c7c2f3',
    borderRadius: 16,
    padding: 16,
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    zIndex: 30,
    width: 320,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  dropdownMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownMenuItem: {
    paddingVertical: 6,
  },
  dropdownMenuItemText: {
    color: '#222',
    fontSize: 16,
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
