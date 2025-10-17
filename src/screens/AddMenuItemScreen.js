import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, ScrollView } from 'react-native';
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
          <View style={styles.dropdownContainer}>
            <Pressable style={styles.dropdown} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
              <Text style={styles.dropdownText}>{
                menus.find(m => m.id === selectedMenuId)?.name || 'Select menu'
              }</Text>
              <MaterialCommunityIcons name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} size={24} color="#222" />
            </Pressable>
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                <Text style={styles.dropdownMenuTitle}>Select Menu</Text>
                <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                  {menus.map((m) => (
                    <Pressable key={m.id} style={styles.dropdownMenuItem} onPress={() => { setSelectedMenuId(m.id); setShowCategoryDropdown(false); }}>
                      <Text style={styles.dropdownMenuItemText}>• {m.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
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
  dropdownContainer: {
    width: '100%',
    marginBottom: 8,
    zIndex: 100,
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ece9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
    minHeight: 44,
  },
  dropdownText: {
    color: '#222',
    fontSize: 15,
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    width: '100%',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#c7c2f3',
  },
  dropdownScrollView: {
    maxHeight: 150,
  },
  dropdownMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b6eea',
    marginBottom: 8,
    textAlign: 'center',
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ece9fa',
  },
  dropdownMenuItemText: {
    color: '#222',
    fontSize: 15,
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
